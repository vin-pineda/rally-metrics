import os
import re
import sys
import logging

import pandas as pd
import psycopg2
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("mlp_scraper")

URL = (
    "https://www.majorleaguepickleball.co/events-2025/"
    "?division=premier&view=player#standings-table"
)
TABLE_ID = "standings-table"
WAIT_TIMEOUT = 30


def build_driver():
    """Create a headless Chrome driver."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--remote-debugging-port=9222")
    try:
        return webdriver.Chrome(options=options)
    except WebDriverException as e:
        logger.error("Failed to start Chrome driver: %s", e)
        raise


def scrape_standings():
    """Load the MLP standings page and return (headers, rows-of-text)."""
    driver = build_driver()
    try:
        logger.info("Loading standings page: %s", URL)
        driver.get(URL)

        # Replace naive sleep with an explicit wait on the standings table.
        try:
            table = WebDriverWait(driver, WAIT_TIMEOUT).until(
                EC.presence_of_element_located((By.ID, TABLE_ID))
            )
        except TimeoutException:
            logger.error(
                "Timed out after %ss waiting for table #%s", WAIT_TIMEOUT, TABLE_ID
            )
            raise

        try:
            rows = table.find_elements(By.TAG_NAME, "tr")
        except WebDriverException as e:
            logger.error("Error reading rows from the standings table: %s", e)
            raise

        if not rows:
            raise RuntimeError("Standings table contained no rows")

        headers = [th.text.strip() for th in rows[0].find_elements(By.TAG_NAME, "th")]
        logger.info("Found %d header columns", len(headers))

        data = []
        skipped = 0
        for i, row in enumerate(rows[1:], start=1):
            try:
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) != len(headers):
                    skipped += 1
                    continue
                data.append([cell.text.strip() for cell in cells])
            except WebDriverException as e:
                logger.warning("Skipping unparsable row %d: %s", i, e)
                skipped += 1

        logger.info("Parsed %d data rows (skipped %d)", len(data), skipped)
        return headers, data
    finally:
        driver.quit()


def clean_dataframe(headers, data):
    """Apply the original cleaning/normalization logic to scraped rows."""
    df = pd.DataFrame(data, columns=headers)
    df.to_csv("raw_stats.csv", index=False)
    logger.info("Raw data saved to raw_stats.csv.")

    df = pd.read_csv("raw_stats.csv")
    split_data = df.iloc[:, 0].str.split("\n", expand=True)
    df["Rank"] = split_data[0].astype(str).str.strip()
    df["Name"] = split_data[1].astype(str).str.title().str.strip()
    df["Team"] = split_data[2].astype(str).str.title().str.strip()

    # Normalize team names
    df["Team"] = df["Team"].replace({
        "New Jersey 5S": "New Jersey 5s",
        "Socal Hard Eights": "SoCal Hard Eights",
    })

    # Capitalize two-letter initials in names
    def capitalize_initials(name):
        parts = name.split()
        if len(parts) >= 1 and len(parts[0]) == 2 and parts[0].isalpha():
            parts[0] = parts[0].upper()
        return " ".join(parts)

    df["Name"] = df["Name"].apply(capitalize_initials)

    df = df.drop(df.columns[0], axis=1)

    def clean_column_name(col):
        col = col.replace("%", "Percent")
        col = re.sub(r"[^\x00-\x7F]+", "", col)
        return col.strip().title()

    df.columns = [clean_column_name(col) for col in df.columns]

    column_order = ["Name", "Rank", "Team"] + [
        col for col in df.columns if col not in ["Name", "Rank", "Team"]
    ]
    df = df[column_order]

    stat_columns = [col for col in df.columns if col not in ["Name", "Rank", "Team"]]
    df = df[~df[stat_columns].isin(["-"]).any(axis=1)]
    df["Rank"] = df["Rank"].astype(int)
    df = df.sort_values(by="Rank").reset_index(drop=True)

    df.to_csv("mlp_stats.csv", index=False)
    logger.info("Cleaned CSV saved to mlp_stats.csv.")
    return df


UPSERT_SQL = """
    INSERT INTO player_statistic (
        name, rank, team,
        games_won, games_lost, games_won_percent,
        pts_won, pts_lost, pts_won_percent
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (name) DO UPDATE SET
        rank = EXCLUDED.rank,
        team = EXCLUDED.team,
        games_won = EXCLUDED.games_won,
        games_lost = EXCLUDED.games_lost,
        games_won_percent = EXCLUDED.games_won_percent,
        pts_won = EXCLUDED.pts_won,
        pts_lost = EXCLUDED.pts_lost,
        pts_won_percent = EXCLUDED.pts_won_percent;
"""


def coerce_row(row):
    """Convert a dataframe row into typed DB values.

    Raises ValueError on bad numeric data so the caller can skip the row.
    """
    return (
        row["Name"],
        int(row["Rank"]),
        row["Team"],
        int(row["Games Won"]),
        int(row["Games Lost"]),
        float(row["Games Won Percent"]),
        int(row["Pts Won"]),
        int(row["Pts Lost"]),
        float(row["Pts Won Percent"]),
    )


def upsert_players(df):
    """Upsert each row into Postgres, skipping rows that fail coercion."""
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )
    try:
        cur = conn.cursor()
        upserted = 0
        skipped = 0
        for _, row in df.iterrows():
            try:
                values = coerce_row(row)
            except (ValueError, KeyError, TypeError) as e:
                logger.warning(
                    "Skipping row for %s due to bad data: %s",
                    row.get("Name", "<unknown>"),
                    e,
                )
                skipped += 1
                continue

            try:
                logger.info(
                    "Upserting %s | Team: %s | Rank: %s",
                    values[0], values[2], values[1],
                )
                cur.execute(UPSERT_SQL, values)
                upserted += 1
            except psycopg2.Error as e:
                logger.warning("Skipping row for %s due to DB error: %s", values[0], e)
                conn.rollback()
                skipped += 1

        conn.commit()
        cur.close()
        logger.info(
            "Upsert complete: %d inserted/updated, %d skipped.", upserted, skipped
        )
        return upserted, skipped
    finally:
        conn.close()


def main():
    try:
        headers, data = scrape_standings()
    except Exception as e:
        logger.error("Scraping failed: %s", e)
        sys.exit(1)

    try:
        df = clean_dataframe(headers, data)
    except Exception as e:
        logger.error("Cleaning the scraped data failed: %s", e)
        sys.exit(1)

    try:
        upsert_players(df)
    except psycopg2.Error as e:
        logger.error("Database connection/operation failed: %s", e)
        sys.exit(1)

    logger.info("Data inserted/updated in PostgreSQL successfully.")


if __name__ == "__main__":
    main()

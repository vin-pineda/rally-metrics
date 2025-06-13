import pandas as pd
import re
import psycopg2
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")
options.add_argument("--remote-debugging-port=9222")

driver = webdriver.Chrome(options=options)

url = "https://www.majorleaguepickleball.co/events-2025/?division=premier&view=player#standings-table"
driver.get(url)
time.sleep(5)

try:
    table = driver.find_element(By.ID, "standings-table")
    rows = table.find_elements(By.TAG_NAME, "tr")
except Exception as e:
    print("Error locating the standings table:", e)
    driver.quit()
    exit()

headers = [th.text.strip() for th in rows[0].find_elements(By.TAG_NAME, "th")]

data = []
for row in rows[1:]:
    cells = row.find_elements(By.TAG_NAME, "td")
    if len(cells) != len(headers):
        continue
    player_data = [cell.text.strip() for cell in cells]
    data.append(player_data)

driver.quit()
df = pd.DataFrame(data, columns=headers)
df.to_csv("raw_stats.csv", index=False)
print("Raw data saved to raw_stats.csv.")

df = pd.read_csv("raw_stats.csv")
split_data = df.iloc[:, 0].str.split("\n", expand=True)
df["Rank"] = split_data[0].astype(str).str.strip()
df["Name"] = split_data[1].astype(str).str.title().str.strip()
df["Team"] = split_data[2].astype(str).str.title().str.strip()

# Normalize team names
df["Team"] = df["Team"].replace({
    "New Jersey 5S": "New Jersey 5s",
    "Socal Hard Eights": "SoCal Hard Eights"
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

column_order = ["Name", "Rank", "Team"] + [col for col in df.columns if col not in ["Name", "Rank", "Team"]]
df = df[column_order]

stat_columns = [col for col in df.columns if col not in ["Name", "Rank", "Team"]]
df = df[~df[stat_columns].isin(["-"]).any(axis=1)]
df["Rank"] = df["Rank"].astype(int)
df = df.sort_values(by="Rank").reset_index(drop=True)

df.to_csv("mlp_stats.csv", index=False)
print("Cleaned CSV saved to mlp_stats.csv.")

conn = psycopg2.connect(
    dbname="********",
    user="********",
    password="********",
    host="********",
    port="********"
)

cur = conn.cursor()

row_count = 0
for _, row in df.iterrows():
    print(f"Inserting row: {row['Name']} | Team: {row['Team']} | Rank: {row['Rank']}")
    cur.execute("""
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
                """, (
                    row["Name"],
                    int(row["Rank"]),
                    row["Team"],
                    int(row["Games Won"]),
                    int(row["Games Lost"]),
                    float(row["Games Won Percent"]),
                    int(row["Pts Won"]),
                    int(row["Pts Lost"]),
                    float(row["Pts Won Percent"])
                ))
    row_count += 1

print(f"Total rows processed: {row_count}")

conn.commit()
cur.close()
conn.close()
print("Data inserted/updated in PostgreSQL successfully.")

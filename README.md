# Rally Metrics

[Rally Metrics](https://www.rallymetrics.com/) helps pickleball fans draft their fantasy
Major League Pickleball (MLP) teams using AI-powered suggestions and real-time player stats.

I grew up an avid pickleball fan and played fantasy pickleball with friends, but no site
showed player stats in a clean, digestible way. Rally Metrics solves that, and goes a step
further with an AI layer (Anthropic Claude) that produces fantasy-draft suggestions and
head-to-head match predictions.

## Architecture (3 tiers)

1. **Scraper** (`src/main/resources/scripts/main.py`) — A Python (pandas + Selenium)
   scraper that pulls the MLP standings table from the official
   [MLP site](https://www.majorleaguepickleball.co/), cleans/normalizes it, and upserts
   it into a PostgreSQL `player_statistic` table. A scheduler runs it every morning to keep
   the database fresh.
2. **Backend** (`/src`) — A Spring Boot 3 / Java 17 application (built with Maven) that
   serves player searches, AI-generated player summaries, and a structured head-to-head
   match predictor. The AI layer uses **Anthropic Claude**.
3. **Frontend** (`/rm-hero`) — A Next.js + TypeScript app (HeroUI) that consumes the
   backend API.

The backend is deployed on Railway and the frontend on Vercel.

## Environment variables

### Backend (`/src`) and scraper

| Variable            | Description                          | Default (host/port) |
| ------------------- | ------------------------------------ | ------------------- |
| `DB_HOST`           | Postgres host                        | `localhost`         |
| `DB_PORT`           | Postgres port                        | `5432`              |
| `DB_NAME`           | Postgres database name               | —                   |
| `DB_USER`           | Postgres user                        | —                   |
| `DB_PASSWORD`       | Postgres password                    | —                   |
| `ANTHROPIC_API_KEY` | API key for the Anthropic Claude API | —                   |

> `ANTHROPIC_API_KEY` is required by the backend for the AI summary and predictor
> features. The scraper only needs the `DB_*` variables.

### Frontend (`/rm-hero`)

| Variable                   | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:8080`) |

## Local setup

### 1. Run a local PostgreSQL (Docker)

```bash
docker run --name rally-postgres \
  -e POSTGRES_DB=rally \
  -e POSTGRES_USER=rally \
  -e POSTGRES_PASSWORD=rally \
  -p 5432:5432 \
  -d postgres:16
```

Then export the matching credentials in your shell (or an `.env` file):

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=rally
export DB_USER=rally
export DB_PASSWORD=rally
export ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Database schema

The scraper and backend share one table, `player_statistic`:

| Column              | Type            | Notes               |
| ------------------- | --------------- | ------------------- |
| `name`              | text            | **Primary key**     |
| `rank`              | integer         |                     |
| `team`              | text            |                     |
| `games_won`         | integer         |                     |
| `games_lost`        | integer         |                     |
| `games_won_percent` | double / numeric|                     |
| `pts_won`           | integer         |                     |
| `pts_lost`          | integer         |                     |
| `pts_won_percent`   | double / numeric|                     |

```sql
CREATE TABLE player_statistic (
    name              TEXT PRIMARY KEY,
    rank              INTEGER,
    team              TEXT,
    games_won         INTEGER,
    games_lost        INTEGER,
    games_won_percent DOUBLE PRECISION,
    pts_won           INTEGER,
    pts_lost          INTEGER,
    pts_won_percent   DOUBLE PRECISION
);
```

## Running the app

### Backend

```bash
./mvnw spring-boot:run
# or build and run the jar
./mvnw clean package -DskipTests
java -jar target/rally-metrics-0.0.1-SNAPSHOT.jar
```

The backend listens on `http://localhost:8080`.

You can also build and run everything (jar + Chromium for the scraper) via Docker:

```bash
docker build -t rally-metrics .
docker run -p 8080:8080 --env-file .env rally-metrics
```

### Frontend

```bash
cd rm-hero
npm install
npm run dev   # http://localhost:3000
```

### Scraper

```bash
pip install -r requirements.txt
python3 src/main/resources/scripts/main.py
```

The scraper requires Chromium + chromedriver to be available and the `DB_*` environment
variables to be set. It logs how many rows were inserted/updated and skips bad rows rather
than crashing the whole run.

## API endpoints

Base path: `/api/v1/player`

### `GET /api/v1/player`

Returns players. Optional query parameters (use one):

- `?searchText=` — fuzzy search by name or team
- `?team=` — filter by team
- `?name=` — search by name

With no parameters, returns all players.

### `GET /api/v1/player/{name}/summary`

Returns an AI-generated (Anthropic Claude) summary for the given player.

### `POST /api/v1/player/predict`

Predicts the head-to-head winner of two players.

Request body:

```json
{
  "playerA": "Ben Johns",
  "playerB": "Federico Staksrud"
}
```

Returns a structured prediction:

```json
{
  "winner_name": "Ben Johns",
  "win_probability": 0.72,
  "moneyline_odds": -257,
  "reasoning": "..."
}
```

---

Powered by [Vin](https://www.linkedin.com/in/vincent-pineda8/)

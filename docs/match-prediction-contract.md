# MatchPrediction contract (Wave 0 — shared by backend Agent A & frontend Agent B)

`POST /api/v1/player/predict` request body is unchanged:

```json
{ "playerA": "Ben Johns", "playerB": "Anna Leigh Waters" }
```

The **response body** changes from a free-text string to this structured object
(serialized as snake_case to match `spring.jackson.property-naming-strategy=SNAKE_CASE`):

```json
{
  "winner_name": "Ben Johns",
  "win_probability": 0.58,
  "moneyline_odds": -138,
  "reasoning": "Two short paragraphs of stat-grounded analysis ..."
}
```

Field semantics:
- `winner_name` (string) — the player the model predicts wins.
- `win_probability` (number, 0–1) — probability that `winner_name` wins, computed by the
  **backend** from real stats (e.g. `gamesWonPercent` normalized across the two players), NOT by the model.
- `moneyline_odds` (integer) — American moneyline for `winner_name`, from the existing
  `calculateMoneylineOdds` (division-by-zero guarded). Negative = favorite.
- `reasoning` (string) — Claude-generated narrative; stat-based, no fabricated scores.

Backend: `getPredictionBetweenPlayers` returns a `MatchPrediction` record/POJO; the controller
returns `ResponseEntity<MatchPrediction>`. The win probability + odds are computed server-side and
passed to Claude, which fills only `reasoning` (via strict tool use / structured output).

Frontend (`/predictor`): render `win_probability` as a %, show `moneyline_odds` (with +/- sign),
and display `reasoning`. Error case (player not found) returns HTTP 404 with a plain message.

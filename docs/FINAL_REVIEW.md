# Rally Metrics — Final Review (10-pass autonomous hardening)

**Status: complete. No commits/pushes made — awaiting go/no-go.**
Final regression: **33/33 backend tests** (0 failures/errors) · frontend `tsc` 0 errors · `lint` 0 errors · all 6 pages console-clean.

---

## Changelog (10 passes)

1. Replaced the toy win-probability (`winPct1/(winPct1+winPct2)`) with a real model: **Pythagorean point-expectation + empirical-Bayes shrinkage + sample-size regression + log5 + vig**; added `confidence`; 19 property tests.
2. Frontend confidence badge (HIGH/MED/LOW) + fixed an empty-logo `next/image` 400.
3. SDK exponential-backoff retries (`maxRetries(3)`) + both AI endpoints made incapable of 500-ing (graceful fallback).
4. Deterministic `key_factors` model-explanation breakdown (`KeyFactor` + `model.keyFactors()`), exposed in the API.
5. **Multi-agent matchup pipeline** — parallel **Scout** agents (Haiku) → **Head Analyst** (Opus) → **Critic** (Haiku, one bounded grounding revision); `MatchAnalysisOrchestrator` with real parallelism, per-stage timeouts, graceful degradation; shared `AnthropicClientProvider` + `StructuredCall`; `ClaudeService` slimmed to summaries; +4 orchestrator tests.
6. Scout-report cache per player + tightened scout timeout (latency/reliability).
7. `ScoutWarmupRunner` — background pre-scout of all players at startup (skipped without an API key) so predictions never wait on or drop a scout.
8. Frontend: key-factors comparison table (advantage-highlighted) + two AI scouting cards + "Multi-agent analysis" caption.
9. Model transparency: `model_version` on the prediction + read-only `GET /api/v1/model/info` (methodology, guarantees, agent pipeline, limits); frontend "How predictions work" disclosure + version footnote.
10. Breadth sweep (all pages console-clean) + final full regression.

---

## AI / modeling writeup

### Deterministic probability model (`prediction/MatchProbabilityModel`, version `rm-match-model-1.0.0`)
Pipeline, each stage a recognized technique:
1. **Pythagorean expectation** on points (`pw^2/(pw^2+pl^2)`) — points are the large, low-variance sample, so the primary skill signal.
2. **Empirical-Bayes shrinkage** of the game win rate toward a 0.5 prior (Beta pseudo-count 4) — a 2-0 record can't masquerade as elite.
3. **Sample-size regression**: blended skill is pulled toward 0.5 by a confidence factor that grows with games played (half-life 10 games).
4. **log5** converts the two skills to a symmetric head-to-head probability.
5. **Vig** (5% overround) is applied before converting to American moneyline.

**Guarantees (unit-tested):** probabilities strictly in (0,1); symmetric `P(A)=1−P(B)`; monotonic in skill; numerically stable at the 0-games / 0-points / equal-skill edges; odds finite (clamped to realistic book bounds). **Confidence** = LOW/MED/HIGH from the smaller player's game sample. **Calibration** sanity tests assert equal players → 0.5 and a modest edge → a modest (non-overconfident) probability.

### Multi-agent narrative layer (`ai/agents/*`)
`Scout ×2 (parallel) → Head Analyst → Critic (1 bounded revision)`. The orchestrator runs the two scouts concurrently on a daemon pool with timeouts; the analyst synthesizes both scouting reports with the model numbers; the critic fact-checks the narrative against the facts and can force exactly one revision. **Guardrail:** the LLMs never compute or override a number — they narrate the deterministic model's output and are checked against it. Every stage degrades gracefully (a failed scout → "unavailable"; a failed critic → approve), so a prediction is always returned and the endpoint can't 500.

### Why it's defensible to a quant
No data leakage (the model only sees season-aggregate stats; the LLM only sees already-final numbers); shrinkage + sample-confidence handle small samples; the head-to-head math is the standard log5; assumptions and limits are documented and served at `/api/v1/model/info`; the numeric core is deterministic and exhaustively unit-tested.

### Limits (also surfaced in the API)
No head-to-head history, court surface, or recency weighting; the Pythagorean exponent and feature weights are fixed priors (not yet fit from match outcomes); season-aggregate stats only.

---

## Test coverage
- `MatchProbabilityModelTest` — 21 tests (bounds, symmetry, monotonicity, shrinkage, vig, edges, calibration, key-factors).
- `MatchAnalysisOrchestratorTest` — 4 tests (parallel scouts, synthesis, critic-revision loop, graceful degradation).
- `PlayerServiceTest` — 4 (model↔agent wiring, zero-stats, not-found, summary cache).
- `PlayerRepositoryTest` — 3 (DB queries on H2). `RallyMetricsApplicationTests` — 1 (context).
- **Total 33, all green.** Claude is mocked; tests need no API key or network.

## Playwright evidence (screenshots in repo root)
Home, Players (+ search), Player summary (live Haiku), Predictor (live multi-agent: key factors + scouting + reasoning + confidence + model footnote), the "How predictions work" disclosure, Teams, Team detail, About — all verified, all console-clean.

---

## Push-readiness checklist
- [x] 33/33 backend tests green; frontend tsc + lint clean.
- [x] No secrets tracked (`application.properties` untracked; `.env*` gitignored).
- [x] 3 endpoint request shapes unchanged (response fields only added).
- [ ] **Rotate the exposed DB password + old Gemini key** from the first commit `cd4deae` (still pending — manual).
- [ ] **Clean working tree before committing:** gitignore/remove the screenshot PNGs (`wt-*.png`, `walkthrough-1-home.png`), `.playwright-mcp/`, `predictor-refs.md`, `predictor-result-snapshot.md` — review artifacts, not source.
- [ ] Decide whether `docs/` (this review + pass log) should be committed or kept local.
- [ ] Set `ANTHROPIC_API_KEY` (+ DB vars) in the real deploy env; the scraper now reads DB creds from env too.
- [ ] Note: prediction latency is ~15–20s (4 model calls; scouts pre-warmed). Consider streaming or a "generating…" UX for production if needed.

## Suggested commit grouping (when you say go)
1. security + dead-code + env (passes 1 setup) · 2. probability model + tests · 3. multi-agent pipeline + tests · 4. frontend (dedup, predictor UI, transparency) · 5. scraper/Docker/README/docs.

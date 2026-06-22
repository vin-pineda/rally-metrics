# Rally Metrics — 10-Pass Hardening Log

Autonomous senior-eng + quant hardening loop. **No commits until the user approves after Pass 10.**
Each pass: hunt → fix → verify (Dockerized `mvn test` + `package`/restart `rm-app` + frontend `lint`/`tsc` + Playwright on :3001) → log.

**Status:** ✅ COMPLETE — **10 / 10 passes done** (awaiting user go/no-go on pushing; no commits made)
**Final regression:** 33/33 backend tests green · frontend `tsc` 0 errors · `lint` 0 errors · all pages console-clean

## Environment (carry forward)
- Build/test ONLY via Docker maven: `docker run --rm -v "$PWD":/app -v rm-m2:/root/.m2 -w /app maven:3.9-eclipse-temurin-17 mvn -q <goal>` (no local JDK).
- Restart backend after backend change: `docker rm -f rm-app; docker run -d --name rm-app -p 8080:8080 --env-file .env -e DB_HOST=host.docker.internal -e SPRING_JPA_DDL_AUTO=none -e RALLY_CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,https://rally-metrics.vercel.app,https://www.rallymetrics.com,https://rallymetrics.com" -v "$PWD/target/rally-metrics-0.0.1-SNAPSHOT.jar":/app.jar eclipse-temurin:17-jre java -jar /app.jar`
- Frontend dev: `next dev` on :3001. **GOTCHA:** running `npm run build` in rm-hero clobbers the live dev server's `.next` → "Internal Server Error". For frontend verification prefer `npx tsc --noEmit` + `npm run lint`; if you must `npm run build`, kill+`rm -rf .next`+restart `PORT=3001 npm run dev` after.
- Postgres: docker `rm-postgres`, seeded (6 players). Backend has ANTHROPIC_API_KEY from .env.

## Passes
| Pass | Summary | tests | build | playwright |
|------|---------|-------|-------|------------|
| 1 | Replaced toy win-prob with **Pythagorean point-expectation + empirical-Bayes shrinkage + sample-confidence regression + log5 + vig** model (`prediction/` pkg); added `confidence` LOW/MED/HIGH; 19 property tests (symmetry, monotonicity, bounds, shrinkage, vig, div-by-zero, calibration) | 27/27 | ok | n/a |
| 2 | Frontend: confidence pill in predictor (HIGH green / MED amber / LOW red + "limited sample" caption); fixed `/teams/` empty-logo next/image 400 with a guard+placeholder | n/a | ok | ok |
| 3 | Backend: configured SDK `maxRetries(3)` (exp-backoff on 408/409/429/5xx/IO); 500-proofed both AI endpoints (catch `RuntimeException` → graceful fallback) | 27/27 | ok | ok (65.9%/-225/HIGH badge) |
| 4 | `key_factors` deterministic model-explanation breakdown (`KeyFactor` + `model.keyFactors()`); API field `key_factors[]`; +2 model tests | 29/29 | ok | n/a |
| 5 | **Multi-agent matchup pipeline**: parallel Scout agents (Haiku) → Analyst (Opus) → grounding Critic (Haiku, one bounded revision). `MatchAnalysisOrchestrator` (real parallelism, per-stage timeouts, graceful degradation), `AnthropicClientProvider` + `StructuredCall` shared plumbing; `ClaudeService` slimmed to summaries; API adds `scouting_a/b`; +4 orchestrator tests | 33/33 | ok | n/a |
| 6 | Scout-report cache per player + scout timeout 25→18s (latency/reliability) | 33/33 | ok | n/a |
| 7 | `ScoutWarmupRunner`: background pre-scout of all players at startup (skipped w/o key) → predictions never wait on or drop a scout | 33/33 | ok | n/a |
| 8 | Frontend: key-factors comparison table (advantage-highlighted) + two AI scouting-report cards + "Multi-agent analysis" caption | 33/33 | tsc+lint ok | ok (full rich panel, ~20s warm) |
| 9 | Model transparency: `model_version` on the prediction + read-only `GET /api/v1/model/info` (methodology, guarantees, agent pipeline, limits); frontend "How predictions work" disclosure + version footnote | 33/33 | tsc+lint ok | ok (disclosure + footnote) |
| 10 | Breadth sweep: all 6 pages console-clean (home/players/teams/[team]/about/predictor); final full regression | 33/33 | tsc+lint ok | ok (all pages) |

## Post-review refinements (user-requested)
| # | Summary | tests | build | playwright |
|---|---------|-------|-------|------------|
| R1 | Cost: Head Analyst moved from `claude-opus-4-8` → **`claude-sonnet-4-6`** ($5/$25 → $3/$15; the analyst is the main per-prediction cost). Quality unchanged; `/api/v1/model/info` updated | 33/33 | ok | ok |
| R2 | Player summary revamped: the expandable row now returns a **structured `PlayerSnapshot`** (deterministic `draft_tier` from model skill + the reused, cached scouting report) instead of 3 prose paragraphs. New `PlayerSnapshotCard` (verdict badge + archetype + stat line + green ▲ strengths / amber ▼ watch-outs / outlook) on the Players & Team pages. Removed the now-dead `ClaudeService`/`ClaudeServiceImpl` (the separate per-summary Haiku call is gone → cheaper). +4 draft-tier tests | 37/37 | tsc+lint ok | ok (snapshot card) |
| R3 | Data fix: seeded win%/pts% were fractions (0.808) shown as "0.8%"; corrected to whole-number percents (80.8) so the table, snapshot stat line, and AI text all agree app-wide. Model unaffected (it computes from raw counts) | 37/37 | n/a | ok |
| R4 | Snapshot polish (user feedback): redesigned card — strengths/watch-outs now green/amber **chips**, removed the redundant stat line (dup of the table row above) | 37/37 | tsc+lint ok | ok (chips) |
| R5 | Scout grounding (user feedback): chips no longer restate displayed numbers; feed the agent explicit games-played + FULL/small sample flag and hard-forbid fabricated context (tournaments/experience/false "small sample"). Insights now 3-7 words, grounded in win/loss/points only. Verified across all 6 players | 37/37 | n/a | ok (grounded) |
| R6 | Snapshot visual upgrade (user feedback — empty space): expanded card is now two-column. Backend adds `skill_rating` (0-100) to the snapshot (deterministic from model). Right "Model Rating" panel: tier-colored radial **skill gauge** + grounded **stat bars** (win rate / point-win % / scoring margin). Collapsed table row unchanged. +1 model test | 38/38 | tsc+lint ok | ok (gauge + bars) |
| R7 | Fix misleading ranking + fill space + design polish (user feedback): replaced the confusing "Top 17%" (#1 player!) with a **rank-based league standing** ("#1 of 6 · Leader", consistent with the table) — backend `league_percentile` → `league_size`. Filled the lower-left with a **team-branding footer** (logo + team + neutral season pills). Applied Emil-Kowalski/Impeccable motion + craft: animated gauge arc + scaleX bar fills (ease-out ≤0.9s, `prefers-reduced-motion`), refined spacing/contrast. Site font unchanged | 38/38 | tsc+lint ok | ok |

## Snapshot visual-polish loop (user-requested, 5 passes — impeccable + Taste + Emil Kowalski; default `frontend-design` skill disabled; site font kept)
| # | Summary | tests | build | playwright |
|---|---------|-------|-------|------------|
| V1 | **Benchmark / relative context** (highest value — stats were absolute): backend `PlayerSnapshot` adds league means (`avg_skill_rating`, `league_avg_win_pct`, `league_avg_pt_win_pct`) computed once from the full field in `PlayerService`. Card now shows each stat against the field: a thin league-avg reference tick on the win-rate / point-win `MeterBar`s, and a small colored "vs avg" delta (green +, red −) on the gauge and both percent bars. `tabular-nums` on the gauge value + stat values. Verified #1 (green +14.1/+5.3/+9) and #6 (red −12.9/−4.3/−8). Test updated → benchmark assertions | 38/38 | tsc+lint ok | ok (ticks + deltas) |
| V2 | **Accessibility + contrast** (impeccable): screen-reader semantics — decorative gauge `<svg>` arc and the `MeterBar` tracks are `aria-hidden` (their values are already real text), so SR users hear the labels/values without redundant unlabeled-graphic noise; card root is a labelled `role="group"` (`"{name} snapshot"`). Contrast fix: V1 delta colors `green-600`/`red-500` (≈3.3:1 / 3.7:1 on white — below WCAG 4.5:1 for small text) bumped to `green-700`/`red-600` and `font-semibold`. No layout change | 38/38 | tsc+lint ok | ok (darker deltas, no console errors) |
| V3 | **Loading skeleton** (Emil/Taste — perceived performance): replaced the bare "Loading snapshot…" text (identical in both `players.tsx` and `teams/[team].tsx`) with an exported `PlayerSnapshotSkeleton` that mirrors the card's exact two-column shape (verdict/archetype pills, strength/watch-out chip rows, team footer; right: Model-Rating label, 124px gauge circle, 4 stat bars). Shimmer is `motion-safe:animate-pulse` (respects `prefers-reduced-motion`); `role="status"` + `sr-only` text. Same shell prevents layout jump on arrival. Verified via injected 20s fetch delay | 38/38 | tsc+lint ok | ok (shimmer skeleton) |
| V4 | **Gauge count-up** (Emil — focal/occasional view earns delight): the center number now animates 0→rating in lock-step with the 0.9s arc sweep via `useMotionValue` + `animate` + `useTransform` (rounded), rendered into a `motion.span`; `prefers-reduced-motion` snaps straight to the value. Polled mid-animation: `26→47→60→66→68→69` (clean ease-out deceleration, lands exact). `tabular-nums` keeps the width steady so digits don't jitter | 38/38 | tsc+lint ok | ok (count-up verified) |
| V5 | **Responsive @375px + divider polish** (Taste/Impeccable): audited the expanded card at 375px (mobile card layout) — single-column stack, **no horizontal overflow** (scrollW==clientW at 360 and 1425), chips/deltas legible. Polish: the Model-Rating panel divider now adapts — `border-t` on mobile (stacked, separates it from the scouting half) switching to `md:border-l` on desktop (side-by-side), matching the card's existing divider language. Verified computed styles: desktop `border-top:0 / border-left:1px`, mobile shows the top rule | 38/38 | tsc+lint ok | ok (375px + 1440px, no console errors) |

## Remaining plan (passes 4–10) — adjust as better issues surface
4. **key_factors**: backend computes a per-feature head-to-head breakdown (shrunk game win%, Pythagorean point win%, point diff/game, sample) returned as `key_factors[]`; frontend renders it (model explainability — big for quant reviewers).
5. **Expected fantasy points / draft value** metric per player (deterministic, tested); expose on player + summary.
6. **Model transparency**: `model_version` field + a small `/api/v1/model/info` (or docs) describing assumptions; surface "how it works" in UI.
7. **Calibration depth**: Brier/repro calibration test over a synthetic set; consider returning both sides' probabilities.
8. **Frontend polish & a11y**: key-factors UI, number formatting, aria labels on predictor/nav, loading skeletons; add favicon (kills the 404).
9. **Scraper/infra**: scraper hardening review; Dockerfile healthcheck dependency (actuator) or endpoint; verify `py_compile`.
10. **Breadth bug hunt**: sweep all pages for console errors, dead code, edge cases; final full regression.

## Backlog / risks
- Secret rotation still pending (old DB password + Gemini key from first commit `cd4deae`).
- Sample seed data uses fractional win% (0.808) → UI shows "0.8%"; real scraped data is fine.

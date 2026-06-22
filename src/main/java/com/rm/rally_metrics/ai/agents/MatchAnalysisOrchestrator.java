package com.rm.rally_metrics.ai.agents;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Orchestrates the multi-agent matchup pipeline:
 *
 * <pre>
 *   scout(A) ┐ (run in parallel)
 *            ├─► analyst ─► critic ──approved──► result
 *   scout(B) ┘                   └─not approved─► analyst (one revision) ─► result
 * </pre>
 *
 * <p>The two scouts run concurrently on a small bounded pool. Every stage degrades gracefully —
 * a failed or slow scout yields an "unavailable" report, a failed critic approves by default — so
 * a prediction is always produced; the deterministic numbers are unaffected regardless.
 */
@Component
public class MatchAnalysisOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(MatchAnalysisOrchestrator.class);
    private static final long SCOUT_TIMEOUT_SECONDS = 18;

    private final ScoutAgent scoutAgent;
    private final AnalystAgent analystAgent;
    private final CriticAgent criticAgent;

    /** Small daemon pool so the two scouts truly overlap without blocking JVM shutdown. */
    private final ExecutorService pool = Executors.newFixedThreadPool(2, r -> {
        Thread t = new Thread(r, "scout-agent");
        t.setDaemon(true);
        return t;
    });

    public MatchAnalysisOrchestrator(ScoutAgent scoutAgent, AnalystAgent analystAgent, CriticAgent criticAgent) {
        this.scoutAgent = scoutAgent;
        this.analystAgent = analystAgent;
        this.criticAgent = criticAgent;
    }

    public MatchAnalysis analyze(MatchAnalysisInput in) {
        // 1) Scout both players in parallel.
        CompletableFuture<ScoutReport> fa = CompletableFuture.supplyAsync(
                () -> scoutAgent.scout(in.playerAName(), in.teamA(), in.statsA()), pool);
        CompletableFuture<ScoutReport> fb = CompletableFuture.supplyAsync(
                () -> scoutAgent.scout(in.playerBName(), in.teamB(), in.statsB()), pool);
        ScoutReport scoutA = join(fa, in.playerAName());
        ScoutReport scoutB = join(fb, in.playerBName());

        // 2) Analyst synthesizes the reports + the deterministic numbers.
        AnalystAgent.AnalystInput analystInput = new AnalystAgent.AnalystInput(
                in.playerAName(), in.playerBName(), scoutA, scoutB,
                in.winnerName(), in.winProbability(), in.moneylineOdds(), in.confidence(),
                in.keyFactorsText(), null);
        String reasoning = analystAgent.analyze(analystInput);

        // 3) Critic verifies grounding; one bounded revision if it flags issues.
        Critique critique = criticAgent.critique(reasoning, factsText(in, scoutA, scoutB));
        if (!critique.approved() && !critique.issues().isEmpty()) {
            log.info("Critic requested revision ({} issue(s)); revising once.", critique.issues().size());
            String notes = String.join("\n- ", critique.issues());
            String revised = analystAgent.analyze(new AnalystAgent.AnalystInput(
                    in.playerAName(), in.playerBName(), scoutA, scoutB,
                    in.winnerName(), in.winProbability(), in.moneylineOdds(), in.confidence(),
                    in.keyFactorsText(), "- " + notes));
            if (revised != null && !revised.isBlank()) {
                reasoning = revised;
            }
        }

        return new MatchAnalysis(reasoning, scoutA, scoutB);
    }

    private ScoutReport join(CompletableFuture<ScoutReport> f, String name) {
        try {
            return f.get(SCOUT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            f.cancel(true);
            log.warn("Scout for '{}' timed out after {}s; proceeding without it.", name, SCOUT_TIMEOUT_SECONDS);
            return ScoutReport.unavailable();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ScoutReport.unavailable();
        } catch (Exception e) {
            log.warn("Scout for '{}' failed: {}", name, e.toString());
            return ScoutReport.unavailable();
        }
    }

    private static String factsText(MatchAnalysisInput in, ScoutReport a, ScoutReport b) {
        return String.format(
                "Predicted winner: %s%nWin probability: %.3f%nMoneyline: %d%nConfidence: %s%n"
                        + "Key factors:%n%s%nScouting A archetype: %s%nScouting B archetype: %s",
                in.winnerName(), in.winProbability(), in.moneylineOdds(), in.confidence(),
                in.keyFactorsText(), a.archetype(), b.archetype());
    }
}

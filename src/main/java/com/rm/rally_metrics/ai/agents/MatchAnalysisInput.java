package com.rm.rally_metrics.ai.agents;

import com.rm.rally_metrics.prediction.PlayerStats;

/**
 * Everything the multi-agent pipeline needs for one matchup. The {@code winnerName},
 * {@code winProbability}, {@code moneylineOdds}, {@code confidence}, and {@code keyFactorsText}
 * are the deterministic model's already-final outputs — the agents narrate, never recompute them.
 */
public record MatchAnalysisInput(
        String playerAName,
        String teamA,
        PlayerStats statsA,
        String playerBName,
        String teamB,
        PlayerStats statsB,
        String winnerName,
        double winProbability,
        int moneylineOdds,
        String confidence,
        String keyFactorsText) {
}

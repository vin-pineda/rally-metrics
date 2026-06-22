package com.rm.rally_metrics.ai;

import com.rm.rally_metrics.ai.agents.ScoutReport;
import com.rm.rally_metrics.prediction.KeyFactor;

import java.util.List;

/**
 * Structured result of a match prediction.
 *
 * <p>With {@code spring.jackson.property-naming-strategy=SNAKE_CASE} these fields serialize as
 * {@code winner_name}, {@code win_probability}, {@code moneyline_odds}, {@code confidence},
 * {@code key_factors}, {@code scouting_a}, {@code scouting_b}, and {@code reasoning}.
 *
 * <p>Everything except {@code reasoning}/{@code scouting_*} is computed by the deterministic match
 * model; {@code reasoning} and the scouting reports come from the multi-agent pipeline (the model
 * owns the numbers, the agents only narrate them).
 */
public record MatchPrediction(
        String winnerName,
        double winProbability,
        int moneylineOdds,
        String confidence,
        String modelVersion,
        List<KeyFactor> keyFactors,
        ScoutReport scoutingA,
        ScoutReport scoutingB,
        String reasoning) {
}

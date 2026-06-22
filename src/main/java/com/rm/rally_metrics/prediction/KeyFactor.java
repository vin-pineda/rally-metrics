package com.rm.rally_metrics.prediction;

/**
 * One row of the model-explanation breakdown for a matchup: a named feature, each player's
 * value (pre-formatted for display), and which side it favors. Computed deterministically by
 * {@link MatchProbabilityModel} so the UI and the LLM see exactly what drove the probability.
 *
 * <p>Serialized snake_case as {@code label}, {@code display_a}, {@code display_b}, {@code advantage}.
 *
 * @param advantage one of {@code "A"}, {@code "B"}, {@code "EVEN"}
 */
public record KeyFactor(String label, String displayA, String displayB, String advantage) {
}

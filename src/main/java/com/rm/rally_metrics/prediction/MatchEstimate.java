package com.rm.rally_metrics.prediction;

/**
 * Output of {@link MatchProbabilityModel#estimate}. All numbers are computed deterministically
 * from the two players' statistics — the LLM never touches them, it only narrates them.
 *
 * @param winnerIsA      whether player A is the predicted winner
 * @param winProbability probability the predicted winner wins, in (0.5, 1)
 * @param moneylineOdds  American moneyline for the predicted winner, vig-adjusted
 * @param confidence     sample-size-driven confidence in the estimate
 * @param skillA         player A's estimated skill in (0,1) (point-expectation + game form, regressed)
 * @param skillB         player B's estimated skill in (0,1)
 */
public record MatchEstimate(
        boolean winnerIsA,
        double winProbability,
        int moneylineOdds,
        Confidence confidence,
        double skillA,
        double skillB) {
}

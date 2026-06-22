package com.rm.rally_metrics.prediction;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Deterministic head-to-head win-probability model for Major League Pickleball matchups.
 *
 * <p>The pipeline is intentionally built from well-known, defensible sports-analytics
 * components rather than an ad-hoc ratio:
 *
 * <ol>
 *   <li><b>Pythagorean expectation</b> (Bill James / Daryl Morey): a player's points won and
 *       lost imply an expected win rate {@code pw^E / (pw^E + pl^E)}. Points are a far larger,
 *       lower-variance sample than games, so this is the primary skill signal.</li>
 *   <li><b>Empirical-Bayes shrinkage</b>: the observed game win rate is shrunk toward a 0.5 prior
 *       with a Beta pseudo-count, so a 2-0 record does not masquerade as elite.</li>
 *   <li><b>Sample-size regression</b>: the blended skill is regressed toward 0.5 by a confidence
 *       factor that grows with games played — thin résumés stay near the mean.</li>
 *   <li><b>Log5</b> (Bill James): converts two skill estimates into a symmetric head-to-head
 *       probability, {@code P(A) = a(1-b) / (a(1-b) + b(1-a))}.</li>
 *   <li><b>Vig</b>: the fair probability is inflated by a configurable overround before being
 *       converted to American moneyline odds, so the line reads like a real sportsbook's.</li>
 * </ol>
 *
 * <p>Guaranteed properties (all unit-tested): probabilities lie strictly in (0,1); the model is
 * symmetric ({@code P(A beats B) = 1 - P(B beats A)}); monotonic in each player's skill; and
 * numerically stable at the 0-games, 0-points, and equal-skill edges. The exponent and weights
 * are constants here but are exactly the parameters one would fit by logistic regression against
 * historical match outcomes.
 */
@Component
public class MatchProbabilityModel {

    /** Version of this deterministic model; surfaced in the API for reproducibility. */
    public static final String MODEL_VERSION = "rm-match-model-1.0.0";

    /** Pythagorean exponent applied to point totals. ~2 is standard for point-scored sports. */
    static final double PYTHAGOREAN_EXPONENT = 2.0;

    /** Beta pseudo-count for shrinking the observed game win rate toward 0.5. */
    static final double GAME_PRIOR_PSEUDOCOUNT = 4.0;

    /** Weight on the point-derived (Pythagorean) skill — larger sample, trusted more. */
    static final double WEIGHT_POINTS = 0.65;

    /** Weight on the shrunk game win rate. {@code WEIGHT_POINTS + WEIGHT_GAMES == 1}. */
    static final double WEIGHT_GAMES = 0.35;

    /** Games played at which the sample-confidence factor reaches 0.5 (regression half-life). */
    static final double CONFIDENCE_HALF_GAMES = 10.0;

    /** Skill is clamped into [EPS, 1-EPS] so log5 never sees a degenerate 0 or 1. */
    static final double SKILL_EPS = 1e-3;

    /** Sportsbook overround applied to each side's fair probability (≈5% margin). */
    static final double VIG = 0.05;

    /** Game-sample thresholds (smaller player) for the qualitative confidence label. */
    static final int CONFIDENCE_LOW_BELOW = 6;
    static final int CONFIDENCE_MEDIUM_BELOW = 20;

    /** Skill thresholds for the deterministic draft-tier verdict. */
    static final double TIER_STRONG_DRAFT = 0.62;
    static final double TIER_SOLID = 0.55;
    static final double TIER_FLEX = 0.48;

    /**
     * Estimate the outcome of A vs B. {@code winProbability} always refers to the predicted winner.
     */
    public MatchEstimate estimate(PlayerStats a, PlayerStats b) {
        double skillA = skill(a);
        double skillB = skill(b);

        double pAWins = log5(skillA, skillB);
        boolean winnerIsA = pAWins >= 0.5;
        double winnerProbability = winnerIsA ? pAWins : 1.0 - pAWins;

        int moneyline = americanOddsWithVig(winnerProbability);
        Confidence confidence = confidence(a, b);

        return new MatchEstimate(winnerIsA, winnerProbability, moneyline, confidence, skillA, skillB);
    }

    /** The player's skill as a 0-100 rating (for display alongside the draft tier). */
    public int skillRating(PlayerStats s) {
        return (int) Math.round(skill(s) * 100.0);
    }

    /**
     * Estimate a single player's latent skill in (0,1): Pythagorean point expectation blended with
     * a shrunk game win rate, then regressed toward 0.5 by sample confidence.
     */
    public double skill(PlayerStats s) {
        double pythagorean = pythagoreanExpectation(s);
        double gameRate = shrunkGameWinRate(s);

        double blended = WEIGHT_POINTS * pythagorean + WEIGHT_GAMES * gameRate;

        // Regress toward 0.5 when the game sample is thin.
        double confidence = s.games() / (s.games() + CONFIDENCE_HALF_GAMES);
        double regressed = 0.5 + confidence * (blended - 0.5);

        return clamp(regressed, SKILL_EPS, 1.0 - SKILL_EPS);
    }

    /** Point-based expected win rate. Returns 0.5 when no points or an even split. */
    private static double pythagoreanExpectation(PlayerStats s) {
        if (s.points() == 0) {
            return 0.5;
        }
        double won = Math.pow(Math.max(s.pointsWon(), 0), PYTHAGOREAN_EXPONENT);
        double lost = Math.pow(Math.max(s.pointsLost(), 0), PYTHAGOREAN_EXPONENT);
        double denom = won + lost;
        return denom == 0.0 ? 0.5 : won / denom;
    }

    /** Game win rate shrunk toward 0.5 with a Beta pseudo-count. Returns 0.5 when no games. */
    private static double shrunkGameWinRate(PlayerStats s) {
        int games = s.games();
        if (games == 0) {
            return 0.5;
        }
        return (s.gamesWon() + 0.5 * GAME_PRIOR_PSEUDOCOUNT) / (games + GAME_PRIOR_PSEUDOCOUNT);
    }

    /**
     * Log5 head-to-head probability that a skill-{@code a} player beats a skill-{@code b} player.
     * Symmetric, monotonic, and equal to 0.5 when {@code a == b}.
     */
    static double log5(double a, double b) {
        double num = a * (1.0 - b);
        double denom = num + b * (1.0 - a);
        return denom == 0.0 ? 0.5 : num / denom;
    }

    /** Largest implied probability a line is allowed to show (≈ -9900), as real books cap. */
    static final double MAX_IMPLIED = 0.99;
    static final double MIN_IMPLIED = 0.01;

    /** Convert the winner's fair probability into vig-adjusted American moneyline odds. */
    int americanOddsWithVig(double fairWinnerProbability) {
        // Apply the book's overround, then clamp to a realistic line range so odds stay finite.
        double implied = clamp(fairWinnerProbability * (1.0 + VIG), MIN_IMPLIED, MAX_IMPLIED);
        if (implied >= 0.5) {
            return (int) Math.round(-100.0 * implied / (1.0 - implied));
        }
        return (int) Math.round(100.0 * (1.0 - implied) / implied);
    }

    /**
     * Deterministic fantasy-draft verdict for a single player, from their model skill rating.
     * Same skill estimate the head-to-head model uses — the verdict is grounded, not LLM-guessed.
     */
    public DraftTier draftTier(PlayerStats s) {
        double skill = skill(s);
        if (skill >= TIER_STRONG_DRAFT) {
            return DraftTier.STRONG_DRAFT;
        }
        if (skill >= TIER_SOLID) {
            return DraftTier.SOLID;
        }
        if (skill >= TIER_FLEX) {
            return DraftTier.FLEX;
        }
        return DraftTier.AVOID;
    }

    /** Confidence label from the smaller player's game sample. */
    Confidence confidence(PlayerStats a, PlayerStats b) {
        int minGames = Math.min(a.games(), b.games());
        if (minGames < CONFIDENCE_LOW_BELOW) {
            return Confidence.LOW;
        }
        if (minGames < CONFIDENCE_MEDIUM_BELOW) {
            return Confidence.MEDIUM;
        }
        return Confidence.HIGH;
    }

    /**
     * The deterministic model-explanation breakdown: the per-feature comparison that drives the
     * probability. Each player's value is pre-formatted; {@code advantage} marks the favored side.
     */
    public List<KeyFactor> keyFactors(PlayerStats a, PlayerStats b) {
        return List.of(
                factor("Game win %", rate(a.gamesWon(), a.games()), rate(b.gamesWon(), b.games())),
                factor("Point win %", rate(a.pointsWon(), a.points()), rate(b.pointsWon(), b.points())),
                factor("Point diff / game", diffPerGame(a), diffPerGame(b)),
                factor("Model skill", skill(a), skill(b)),
                factor("Sample (games)", a.games(), b.games()));
    }

    private static KeyFactor factor(String label, double valueA, double valueB) {
        boolean isPercentLike = !label.startsWith("Point diff") && !label.startsWith("Sample");
        boolean isSample = label.startsWith("Sample");
        String da = isSample ? String.valueOf((int) valueA)
                : isPercentLike ? percent(valueA) : signed(valueA);
        String db = isSample ? String.valueOf((int) valueB)
                : isPercentLike ? percent(valueB) : signed(valueB);
        String advantage = advantage(valueA, valueB);
        return new KeyFactor(label, da, db, advantage);
    }

    /** "A" / "B" / "EVEN" — higher value favored, with a small tolerance for ties. */
    private static String advantage(double a, double b) {
        double tol = 1e-9 + 1e-3 * Math.max(Math.abs(a), Math.abs(b));
        if (Math.abs(a - b) <= tol) {
            return "EVEN";
        }
        return a > b ? "A" : "B";
    }

    private static double rate(int won, int total) {
        return total == 0 ? 0.0 : (double) won / total;
    }

    private static double diffPerGame(PlayerStats s) {
        return s.games() == 0 ? 0.0 : (double) (s.pointsWon() - s.pointsLost()) / s.games();
    }

    private static String percent(double v) {
        return String.format("%.1f%%", v * 100.0);
    }

    private static String signed(double v) {
        return String.format("%+.1f", v);
    }

    private static double clamp(double v, double lo, double hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}

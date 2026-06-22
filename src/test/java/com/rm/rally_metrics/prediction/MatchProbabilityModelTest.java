package com.rm.rally_metrics.prediction;

import org.junit.jupiter.api.Test;
import org.assertj.core.data.Offset;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based rigor tests for {@link MatchProbabilityModel}. These are the checks a quant
 * reviewer would run: bounds, symmetry, monotonicity, sample-size shrinkage, vig application,
 * numerical stability at the degenerate edges, and basic calibration sanity.
 */
class MatchProbabilityModelTest {

    private final MatchProbabilityModel model = new MatchProbabilityModel();
    private static final Offset<Double> EPS = Offset.offset(1e-9);

    private static PlayerStats stats(int gw, int gl, int pw, int pl) {
        return new PlayerStats(gw, gl, pw, pl);
    }

    // ---- log5 core ----------------------------------------------------------

    @Test
    void log5_isSymmetric_andSumsToOne() {
        double[][] pairs = {{0.8, 0.6}, {0.55, 0.55}, {0.9, 0.1}, {0.501, 0.499}};
        for (double[] ab : pairs) {
            double pAB = MatchProbabilityModel.log5(ab[0], ab[1]);
            double pBA = MatchProbabilityModel.log5(ab[1], ab[0]);
            assertThat(pAB + pBA).isCloseTo(1.0, EPS);
        }
    }

    @Test
    void log5_equalSkill_isCoinFlip() {
        assertThat(MatchProbabilityModel.log5(0.73, 0.73)).isCloseTo(0.5, EPS);
    }

    @Test
    void log5_isMonotonicInFirstSkill() {
        double prev = -1;
        for (double a = 0.2; a <= 0.9; a += 0.1) {
            double p = MatchProbabilityModel.log5(a, 0.5);
            assertThat(p).isGreaterThan(prev);
            prev = p;
        }
    }

    @Test
    void log5_isBoundedStrictlyBetweenZeroAndOne() {
        assertThat(MatchProbabilityModel.log5(0.999, 0.001)).isLessThan(1.0).isGreaterThan(0.5);
        assertThat(MatchProbabilityModel.log5(0.001, 0.999)).isGreaterThan(0.0).isLessThan(0.5);
    }

    // ---- skill: shrinkage + regression -------------------------------------

    @Test
    void skill_smallSampleRegressesTowardMeanMoreThanLargeSample() {
        // Same win ratios (2:1 games, 2:1 points) but very different sample sizes.
        double small = model.skill(stats(4, 2, 66, 33));
        double large = model.skill(stats(40, 20, 660, 330));
        assertThat(large).isGreaterThan(small);     // big sample earns a more extreme skill
        assertThat(small).isGreaterThan(0.5);        // still favored, just regressed
    }

    @Test
    void skill_isMonotonicInPointsWon() {
        double low = model.skill(stats(20, 20, 500, 500));
        double mid = model.skill(stats(20, 20, 700, 500));
        double high = model.skill(stats(20, 20, 900, 500));
        assertThat(mid).isGreaterThan(low);
        assertThat(high).isGreaterThan(mid);
    }

    @Test
    void skill_equalPointsAndGames_isExactlyHalf() {
        assertThat(model.skill(stats(25, 25, 500, 500))).isCloseTo(0.5, EPS);
    }

    @Test
    void skill_zeroData_isHalf_noException() {
        assertThat(model.skill(stats(0, 0, 0, 0))).isCloseTo(0.5, EPS);
    }

    @Test
    void skill_isAlwaysStrictlyInsideUnitInterval_evenAtExtremes() {
        double dominant = model.skill(stats(100, 0, 1000, 0));
        double awful = model.skill(stats(0, 100, 0, 1000));
        assertThat(dominant).isLessThan(1.0).isGreaterThan(0.5);
        assertThat(awful).isGreaterThan(0.0).isLessThan(0.5);
    }

    // ---- estimate: end-to-end ----------------------------------------------

    @Test
    void estimate_isOrderSymmetric() {
        PlayerStats a = stats(42, 10, 820, 540);
        PlayerStats b = stats(30, 22, 700, 660);
        MatchEstimate ab = model.estimate(a, b);
        MatchEstimate ba = model.estimate(b, a);
        // Same matchup, same winner probability regardless of argument order.
        assertThat(ab.winProbability()).isCloseTo(ba.winProbability(), Offset.offset(1e-12));
        assertThat(ab.winnerIsA()).isTrue();
        assertThat(ba.winnerIsA()).isFalse();
    }

    @Test
    void estimate_winnerProbabilityAlwaysAtLeastHalf() {
        MatchEstimate e = model.estimate(stats(5, 30, 300, 700), stats(40, 5, 900, 400));
        assertThat(e.winProbability()).isBetween(0.5, 1.0);
        assertThat(e.winnerIsA()).isFalse(); // B is far stronger
    }

    @Test
    void estimate_zeroVsZero_isFiftyFiftyAndLowConfidence() {
        MatchEstimate e = model.estimate(stats(0, 0, 0, 0), stats(0, 0, 0, 0));
        assertThat(e.winProbability()).isCloseTo(0.5, EPS);
        assertThat(e.confidence()).isEqualTo(Confidence.LOW);
    }

    // ---- moneyline + vig ----------------------------------------------------

    @Test
    void vig_makesFavoriteOddsMoreNegativeThanFair() {
        int fair = fairAmericanOdds(0.60);          // -150
        int withVig = model.americanOddsWithVig(0.60); // implied 0.63 -> -170
        assertThat(fair).isEqualTo(-150);
        assertThat(withVig).isEqualTo(-170);
        assertThat(withVig).isLessThan(fair);        // book margin makes it worse for the bettor
    }

    @Test
    void vig_evenMatchupStillCarriesBookMargin() {
        // A true coin flip should NOT be +100/-100; the vig makes it ~ -111.
        int odds = model.americanOddsWithVig(0.50);
        assertThat(odds).isLessThan(-100).isGreaterThan(-130);
    }

    @Test
    void moneyline_isMonotonic_strongerFavoriteHasMoreNegativeOdds() {
        int slight = model.americanOddsWithVig(0.55);
        int strong = model.americanOddsWithVig(0.75);
        assertThat(strong).isLessThan(slight);
    }

    @Test
    void moneyline_extremeFavorite_isFiniteNotInfinite() {
        int odds = model.americanOddsWithVig(0.999);
        assertThat(odds).isNegative().isGreaterThan(-1_000_000); // clamped, finite
    }

    // ---- confidence labels --------------------------------------------------

    @Test
    void confidence_isDrivenBySmallerSample() {
        assertThat(model.confidence(stats(2, 2, 40, 40), stats(40, 40, 800, 800)))
                .isEqualTo(Confidence.LOW);          // min games = 4
        assertThat(model.confidence(stats(6, 6, 120, 120), stats(40, 40, 800, 800)))
                .isEqualTo(Confidence.MEDIUM);        // min games = 12
        assertThat(model.confidence(stats(15, 15, 300, 300), stats(40, 40, 800, 800)))
                .isEqualTo(Confidence.HIGH);          // min games = 30
    }

    // ---- calibration sanity -------------------------------------------------

    @Test
    void calibration_identicalPlayers_areFiftyFifty() {
        PlayerStats s = stats(30, 20, 700, 600);
        MatchEstimate e = model.estimate(s, s);
        assertThat(e.winProbability()).isCloseTo(0.5, EPS);
    }

    @Test
    void calibration_modestEdgeProducesModestProbability_notOverconfident() {
        // A clearly-better-but-not-dominant player should land in a sane band, not 0.95.
        MatchEstimate e = model.estimate(stats(32, 20, 760, 640), stats(28, 24, 700, 660));
        assertThat(e.winProbability()).isBetween(0.52, 0.80);
    }

    // ---- key factors (model explanation) ----------------------------------

    @Test
    void keyFactors_advantagesReflectTheStrongerPlayer() {
        List<KeyFactor> f = model.keyFactors(stats(42, 10, 820, 540), stats(30, 22, 700, 660));
        assertThat(f).extracting(KeyFactor::label).contains(
                "Game win %", "Point win %", "Point diff / game", "Model skill", "Sample (games)");
        assertThat(byLabel(f, "Game win %").advantage()).isEqualTo("A");
        assertThat(byLabel(f, "Point win %").advantage()).isEqualTo("A");
        assertThat(byLabel(f, "Model skill").advantage()).isEqualTo("A");
    }

    @Test
    void keyFactors_identicalPlayersAreAllEven() {
        List<KeyFactor> f = model.keyFactors(stats(30, 20, 700, 600), stats(30, 20, 700, 600));
        assertThat(f).allSatisfy(k -> assertThat(k.advantage()).isEqualTo("EVEN"));
    }

    private static KeyFactor byLabel(List<KeyFactor> factors, String label) {
        return factors.stream().filter(k -> k.label().equals(label)).findFirst().orElseThrow();
    }

    // ---- draft tier (deterministic verdict) --------------------------------

    @Test
    void draftTier_elitePlayerIsStrongDraft() {
        assertThat(model.draftTier(stats(42, 10, 820, 540))).isEqualTo(DraftTier.STRONG_DRAFT);
    }

    @Test
    void draftTier_averagePlayerIsFlex() {
        assertThat(model.draftTier(stats(26, 26, 600, 600))).isEqualTo(DraftTier.FLEX);
    }

    @Test
    void draftTier_losingPlayerIsAvoid() {
        assertThat(model.draftTier(stats(10, 30, 400, 700))).isEqualTo(DraftTier.AVOID);
    }

    @Test
    void skillRating_isZeroTo100_andHigherForBetterPlayers() {
        int elite = model.skillRating(stats(42, 10, 820, 540));
        int weak = model.skillRating(stats(10, 30, 400, 700));
        assertThat(elite).isBetween(0, 100).isGreaterThan(weak);
        assertThat(weak).isBetween(0, 100);
    }

    @Test
    void draftTier_isMonotonicAsPlayerWeakens() {
        // enum order STRONG_DRAFT < SOLID < FLEX < AVOID — a stronger player gets an earlier tier.
        int elite = model.draftTier(stats(42, 10, 820, 540)).ordinal();
        int average = model.draftTier(stats(26, 26, 600, 600)).ordinal();
        int weak = model.draftTier(stats(10, 30, 400, 700)).ordinal();
        assertThat(elite).isLessThanOrEqualTo(average);
        assertThat(average).isLessThanOrEqualTo(weak);
    }

    /** Fair (no-vig) American odds for a probability, for comparison in vig tests. */
    private static int fairAmericanOdds(double p) {
        if (p >= 0.5) {
            return (int) Math.round(-100.0 * p / (1.0 - p));
        }
        return (int) Math.round(100.0 * (1.0 - p) / p);
    }
}

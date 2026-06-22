package com.rm.rally_metrics.player;

import com.rm.rally_metrics.ai.agents.ScoutReport;
import com.rm.rally_metrics.prediction.DraftTier;

/**
 * Structured, scannable player summary shown when a player row is expanded — replaces the old
 * free-text paragraphs.
 *
 * <p>Serialized snake_case as {@code draft_tier}, {@code skill_rating}, {@code league_size},
 * and {@code scouting} (the nested report carries {@code archetype}, {@code strengths},
 * {@code weaknesses}, {@code outlook}). The tier and rating are computed deterministically from the
 * model; the scouting report is the same one (cached + warmed) the predictor uses, so the two
 * surfaces stay consistent and no extra LLM call is made per view.
 *
 * <p>The frontend pairs {@code league_size} with the player's own {@code rank} (already on the
 * player row) to show the league standing — consistent with the rank shown in the table.
 *
 * <p>League averages ({@code avg_skill_rating}, {@code league_avg_win_pct},
 * {@code league_avg_pt_win_pct}) let the UI show each stat against the field instead of in a
 * vacuum, and are computed the same way regardless of which page requested the snapshot.
 *
 * @param skillRating        the player's model skill on a 0-100 scale
 * @param leagueSize         number of players in the league (for "#rank of N" standing)
 * @param avgSkillRating     league mean model skill (0-100), as a benchmark for the gauge
 * @param leagueAvgWinPct    league mean game win % (benchmark for the win-rate bar)
 * @param leagueAvgPtWinPct  league mean point win % (benchmark for the point-win bar)
 */
public record PlayerSnapshot(
        DraftTier draftTier,
        int skillRating,
        int leagueSize,
        int avgSkillRating,
        double leagueAvgWinPct,
        double leagueAvgPtWinPct,
        ScoutReport scouting) {
}

package com.rm.rally_metrics.ai.agents;

/**
 * Final product of the multi-agent matchup pipeline: the critic-verified narrative plus the two
 * per-player scouting reports that informed it.
 *
 * @param reasoning grounded, two-paragraph narrative from the analyst agent
 * @param scoutA    scouting report for player A
 * @param scoutB    scouting report for player B
 */
public record MatchAnalysis(String reasoning, ScoutReport scoutA, ScoutReport scoutB) {
}

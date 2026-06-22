package com.rm.rally_metrics.ai.agents;

import java.util.List;

/**
 * Structured scouting report for a single player, produced by a {@link ScoutAgent}.
 *
 * <p>Serialized snake_case as {@code archetype}, {@code strengths}, {@code weaknesses}, {@code outlook}.
 *
 * @param archetype  short playstyle label, e.g. "Aggressive baseline closer"
 * @param strengths  2–3 concise, stat-grounded strengths
 * @param weaknesses 1–2 concise, stat-grounded weaknesses
 * @param outlook    one-sentence fantasy outlook
 */
public record ScoutReport(String archetype, List<String> strengths, List<String> weaknesses, String outlook) {

    /** Neutral report used when scouting is unavailable, so the pipeline degrades gracefully. */
    public static ScoutReport unavailable() {
        return new ScoutReport("Unavailable", List.of(), List.of(), "Scouting report unavailable.");
    }
}

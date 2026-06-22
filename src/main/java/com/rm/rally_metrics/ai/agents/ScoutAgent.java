package com.rm.rally_metrics.ai.agents;

import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.Model;
import com.anthropic.models.messages.Tool;
import com.rm.rally_metrics.ai.AnthropicClientProvider;
import com.rm.rally_metrics.ai.StructuredCall;
import com.rm.rally_metrics.prediction.PlayerStats;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static com.anthropic.core.JsonValue.from;

/**
 * Scout agent — turns one player's raw statistics into a structured scouting report (playstyle
 * archetype, strengths, weaknesses, outlook). Uses the cheap, fast {@code claude-haiku-4-5}; two
 * of these run in parallel per matchup. Never throws: on any failure it returns
 * {@link ScoutReport#unavailable()} so the pipeline degrades gracefully.
 */
@Component
public class ScoutAgent {

    private static final Logger log = LoggerFactory.getLogger(ScoutAgent.class);

    private static final String SYSTEM = """
            You are a Major League Pickleball talent scout writing short, scannable scouting tags for
            a fantasy app. You are given ONLY these season statistics: games won/lost and points
            won/lost (and what they directly imply: win rate, point differential, points per game,
            and the games-played sample size). The exact numbers are ALREADY shown to the user in a
            stats table next to your tags.

            - archetype: a short playstyle label, 2-4 words (e.g. "Aggressive all-court closer").
            - strengths: 2-3 items, each a short INSIGHT of 3-7 words describing what the win/scoring
              profile MEANS for fantasy — e.g. "Wins the matches that matter", "Strong cushion in tight
              games", "Efficient, high-volume scorer", "Reliable week-to-week floor".
            - weaknesses: 1-2 items, same style, grounded in the data — e.g. "Slimmer margin than the
              elite tier", "Concedes points in bunches", "Already near peak efficiency".
            - outlook: ONE short sentence, max ~12 words.

            STRICT GROUNDING — do not get this wrong:
            - Base EVERY claim only on the win/loss and points data. Describe the implication, not the raw stat.
            - Do NOT restate the displayed numbers (no "76.9% win rate", "+240 point margin", "820 points").
            - Do NOT invent anything the data cannot show: nothing about tournaments, experience, age,
              injuries, specific shots, net/baseline positioning specifics, opponents, or surfaces.
            - NEVER cite sample size, "limited play", or "variance" as a weakness when GAMES PLAYED is
              15 or more — the prompt tells you whether the sample is FULL or small; trust it, do not guess.
            - weaknesses: 1-2 items, and ONE is fine if that's all the data honestly supports. For a
              dominant player a fair weakness is "already near peak efficiency" or "little room to
              improve" — never a fabricated flaw.

            Return ONLY via the tool.
            """;

    private final AnthropicClientProvider clients;

    /** Scouting is stable for a given player over a season; cache successful reports by name. */
    private final Map<String, ScoutReport> cache = new ConcurrentHashMap<>();

    public ScoutAgent(AnthropicClientProvider clients) {
        this.clients = clients;
    }

    public ScoutReport scout(String name, String team, PlayerStats s) {
        ScoutReport cached = cache.get(name);
        if (cached != null) {
            return cached;
        }
        String user = String.format(
                "Player: %s (Team: %s)%n"
                        + "GAMES PLAYED THIS SEASON: %d  (won %d, lost %d — %.1f%% win rate)%n"
                        + "Points: won %d, lost %d (differential %+d, %.1f points won per game)%n"
                        + "Note: %d games is a %s sample.",
                name, team, s.games(), s.gamesWon(), s.gamesLost(),
                s.games() == 0 ? 0.0 : 100.0 * s.gamesWon() / s.games(),
                s.pointsWon(), s.pointsLost(), s.pointsWon() - s.pointsLost(),
                s.games() == 0 ? 0.0 : (double) s.pointsWon() / s.games(),
                s.games(), s.games() >= 15 ? "FULL, reliable" : "small");

        try {
            Optional<Map<String, JsonValue>> input = StructuredCall.callForToolInput(
                    clients.get(), Model.CLAUDE_HAIKU_4_5, 500, SYSTEM, user, tool());
            if (input.isEmpty()) {
                return ScoutReport.unavailable();
            }
            Map<String, JsonValue> in = input.get();
            ScoutReport report = new ScoutReport(
                    StructuredCall.string(in, "archetype", "Unavailable"),
                    StructuredCall.stringList(in, "strengths"),
                    StructuredCall.stringList(in, "weaknesses"),
                    StructuredCall.string(in, "outlook", ""));
            cache.put(name, report); // only successful reports reach here
            return report;
        } catch (RuntimeException e) {
            log.warn("Scout agent failed for '{}': {}", name, e.toString());
            return ScoutReport.unavailable();
        }
    }

    private static Tool tool() {
        Tool.InputSchema schema = Tool.InputSchema.builder()
                .properties(from(Map.of(
                        "archetype", Map.of("type", "string",
                                "description", "Short playstyle label, e.g. 'Aggressive baseline closer'"),
                        "strengths", Map.of("type", "array", "items", Map.of("type", "string"),
                                "description", "2-3 grounded insight phrases (3-7 words); no raw stat numbers"),
                        "weaknesses", Map.of("type", "array", "items", Map.of("type", "string"),
                                "description", "1-2 grounded insight phrases (3-7 words); no raw stat numbers"),
                        "outlook", Map.of("type", "string",
                                "description", "One short fantasy outlook sentence (max ~12 words)"))))
                .putAdditionalProperty("required",
                        from(List.of("archetype", "strengths", "weaknesses", "outlook")))
                .putAdditionalProperty("additionalProperties", from(false))
                .build();
        return Tool.builder()
                .name("submit_scouting_report")
                .description("Submit the structured scouting report for this player.")
                .inputSchema(schema)
                .strict(true)
                .build();
    }
}

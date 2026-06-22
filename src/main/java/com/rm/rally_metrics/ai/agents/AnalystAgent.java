package com.rm.rally_metrics.ai.agents;

import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.Model;
import com.anthropic.models.messages.Tool;
import com.rm.rally_metrics.ai.AnthropicClientProvider;
import com.rm.rally_metrics.ai.StructuredCall;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.anthropic.core.JsonValue.from;

/**
 * Head analyst agent — synthesizes the two scouting reports plus the deterministic model output
 * (winner, probability, moneyline, confidence, key factors) into a grounded two-paragraph
 * narrative. Uses {@code claude-sonnet-4-6}: a constrained writing task over already-final numbers
 * doesn't need Opus, and Sonnet is markedly cheaper. It NEVER recomputes the numbers; they are
 * inputs. When the critic rejects a draft, the same agent is asked to revise against the issues.
 */
@Component
public class AnalystAgent {

    private static final Logger log = LoggerFactory.getLogger(AnalystAgent.class);

    private static final String SYSTEM = """
            You are the head analyst for a Major League Pickleball fantasy desk. You receive two
            players' scouting reports plus a quantitative model's output (predicted winner, win
            probability, American moneyline, and a LOW/MEDIUM/HIGH confidence) that are ALREADY final.

            Do NOT recompute or contradict the winner, probability, odds, or confidence. Do NOT invent
            game scores. Write two short paragraphs explaining why the predicted winner is favored,
            drawing on the scouting reports and the key-factor comparison. When confidence is LOW,
            explicitly acknowledge the small sample and hedge. If revision notes are provided, fix
            exactly those issues while keeping everything else.

            Plain prose only: no HTML tags, no markdown. Separate the two paragraphs with one blank
            line. Return your analysis ONLY by calling the provided tool.
            """;

    private final AnthropicClientProvider clients;

    public AnalystAgent(AnthropicClientProvider clients) {
        this.clients = clients;
    }

    public String analyze(AnalystInput in) {
        try {
            Optional<Map<String, JsonValue>> input = StructuredCall.callForToolInput(
                    clients.get(), Model.CLAUDE_SONNET_4_6, 1200, SYSTEM, userPrompt(in), tool());
            return input
                    .map(m -> stripHtml(StructuredCall.string(m, "reasoning", "")))
                    .filter(s -> !s.isBlank())
                    .orElseGet(() -> fallback(in));
        } catch (RuntimeException e) {
            log.error("Analyst agent failed: {}", e.toString());
            return fallback(in);
        }
    }

    private static String userPrompt(AnalystInput in) {
        StringBuilder sb = new StringBuilder();
        sb.append("PLAYER A — ").append(in.playerAName()).append('\n')
                .append(scoutBlock(in.scoutA())).append('\n');
        sb.append("PLAYER B — ").append(in.playerBName()).append('\n')
                .append(scoutBlock(in.scoutB())).append('\n');
        sb.append("MODEL OUTPUT (final):\n")
                .append("Predicted winner: ").append(in.winnerName()).append('\n')
                .append(String.format("Win probability: %.3f%n", in.winProbability()))
                .append("Moneyline: ").append(in.moneylineOdds()).append('\n')
                .append("Confidence: ").append(in.confidence()).append('\n')
                .append("Key factors:\n").append(in.keyFactorsText()).append('\n');
        if (in.revisionNotes() != null && !in.revisionNotes().isBlank()) {
            sb.append("\nREVISION NOTES — fix these grounding issues:\n").append(in.revisionNotes());
        }
        return sb.toString();
    }

    private static String scoutBlock(ScoutReport r) {
        return "  Archetype: " + r.archetype() + "\n"
                + "  Strengths: " + String.join("; ", r.strengths()) + "\n"
                + "  Weaknesses: " + String.join("; ", r.weaknesses()) + "\n"
                + "  Outlook: " + r.outlook();
    }

    private static String fallback(AnalystInput in) {
        return "Statistical edge favors " + in.winnerName() + " based on superior win rate.";
    }

    private static String stripHtml(String value) {
        return value
                .replaceAll("(?i)\\s*</p>\\s*<p>\\s*", "\n\n")
                .replaceAll("(?i)</?p\\s*/?>", "")
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .trim();
    }

    private static Tool tool() {
        Tool.InputSchema schema = Tool.InputSchema.builder()
                .properties(from(Map.of(
                        "reasoning", Map.of("type", "string",
                                "description", "Two short, plain-prose paragraphs of stat-grounded analysis."))))
                .putAdditionalProperty("required", from(List.of("reasoning")))
                .putAdditionalProperty("additionalProperties", from(false))
                .build();
        return Tool.builder()
                .name("submit_reasoning")
                .description("Submit the narrative reasoning for the match prediction.")
                .inputSchema(schema)
                .strict(true)
                .build();
    }

    /**
     * Inputs for the analyst. {@code revisionNotes} is null on the first pass and carries the
     * critic's issues on a revision.
     */
    public record AnalystInput(
            String playerAName,
            String playerBName,
            ScoutReport scoutA,
            ScoutReport scoutB,
            String winnerName,
            double winProbability,
            int moneylineOdds,
            String confidence,
            String keyFactorsText,
            String revisionNotes) {
    }
}

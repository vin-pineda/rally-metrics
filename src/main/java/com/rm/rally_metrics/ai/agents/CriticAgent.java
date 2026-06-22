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
 * Critic agent — a grounding guardrail. It reads the analyst's narrative against the supplied
 * facts (the model numbers, key factors, and scouting reports) and flags any claim that is
 * unsupported or contradicts the numbers. Uses {@code claude-haiku-4-5}. If it cannot run, it
 * approves by default — the critic improves quality but must never block a prediction.
 */
@Component
public class CriticAgent {

    private static final Logger log = LoggerFactory.getLogger(CriticAgent.class);

    private static final String SYSTEM = """
            You are a fact-checking editor for a pickleball analytics desk. You are given a set of
            FACTS (model numbers, key-factor comparison, scouting reports) and a draft ANALYSIS.
            Approve the analysis only if every claim is supported by, and consistent with, the facts —
            in particular it must not contradict the predicted winner, probability, odds, or confidence,
            and must not invent specific game scores. If anything is unsupported or contradictory, set
            approved=false and list the specific issues to fix. Respond ONLY by calling the tool.
            """;

    private final AnthropicClientProvider clients;

    public CriticAgent(AnthropicClientProvider clients) {
        this.clients = clients;
    }

    public Critique critique(String analysis, String facts) {
        String user = "FACTS:\n" + facts + "\n\nANALYSIS:\n" + analysis;
        try {
            Optional<Map<String, JsonValue>> input = StructuredCall.callForToolInput(
                    clients.get(), Model.CLAUDE_HAIKU_4_5, 400, SYSTEM, user, tool());
            if (input.isEmpty()) {
                return Critique.approvedByDefault();
            }
            Map<String, JsonValue> in = input.get();
            return new Critique(
                    StructuredCall.bool(in, "approved", true),
                    StructuredCall.stringList(in, "issues"));
        } catch (RuntimeException e) {
            log.warn("Critic agent failed, approving by default: {}", e.toString());
            return Critique.approvedByDefault();
        }
    }

    private static Tool tool() {
        Tool.InputSchema schema = Tool.InputSchema.builder()
                .properties(from(Map.of(
                        "approved", Map.of("type", "boolean",
                                "description", "True only if the analysis is fully grounded in the facts."),
                        "issues", Map.of("type", "array", "items", Map.of("type", "string"),
                                "description", "Specific problems to fix; empty when approved."))))
                .putAdditionalProperty("required", from(List.of("approved", "issues")))
                .putAdditionalProperty("additionalProperties", from(false))
                .build();
        return Tool.builder()
                .name("submit_review")
                .description("Submit the grounding review of the analysis.")
                .inputSchema(schema)
                .strict(true)
                .build();
    }
}

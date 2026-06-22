package com.rm.rally_metrics.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.CacheControlEphemeral;
import com.anthropic.models.messages.ContentBlock;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Model;
import com.anthropic.models.messages.TextBlockParam;
import com.anthropic.models.messages.Tool;
import com.anthropic.models.messages.ToolChoiceTool;
import com.anthropic.models.messages.ToolUseBlock;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Shared plumbing for "ask Claude to return a structured object" calls used by every agent.
 *
 * <p>Each call forces a single strict tool ({@code tool_choice} = that tool) so the model must
 * answer by populating the tool's schema — guaranteeing parseable, structured output. Thinking is
 * intentionally never enabled here: a forced {@code tool_choice} plus thinking is rejected by the
 * API (400). The stable system prompt is sent as a cached block for prompt-cache reuse.
 */
public final class StructuredCall {

    private StructuredCall() {
    }

    /** A system text block with ephemeral prompt caching so the stable prefix is reused. */
    public static TextBlockParam cachedSystem(String text) {
        return TextBlockParam.builder()
                .text(text)
                .cacheControl(CacheControlEphemeral.builder().build())
                .build();
    }

    /**
     * Run a forced-single-tool call and return the tool's input object, or empty if the model
     * produced no usable tool call.
     */
    public static Optional<Map<String, JsonValue>> callForToolInput(
            AnthropicClient client, Model model, long maxTokens,
            String systemPrompt, String userPrompt, Tool tool) {

        MessageCreateParams params = MessageCreateParams.builder()
                .model(model)
                .maxTokens(maxTokens)
                .systemOfTextBlockParams(List.of(cachedSystem(systemPrompt)))
                .addTool(tool)
                .toolChoice(ToolChoiceTool.builder().name(tool.name()).build())
                .addUserMessage(userPrompt)
                .build();

        Message message = client.messages().create(params);
        for (ContentBlock block : message.content()) {
            if (block.isToolUse()) {
                ToolUseBlock toolUse = block.asToolUse();
                Optional<? extends Map<String, JsonValue>> input = toolUse._input().asObject();
                if (input.isPresent()) {
                    return Optional.of(Map.copyOf(input.get()));
                }
            }
        }
        return Optional.empty();
    }

    /** Read a plain string field from a tool-input map (handles the SDK's quoted JSON values). */
    public static String string(Map<String, JsonValue> input, String key, String fallback) {
        JsonValue v = input.get(key);
        if (v == null) {
            return fallback;
        }
        String raw = v.toString().trim();
        if (raw.length() >= 2 && raw.startsWith("\"") && raw.endsWith("\"")) {
            raw = raw.substring(1, raw.length() - 1);
        }
        return raw.isBlank() ? fallback : unescape(raw);
    }

    /** Read a list-of-strings field from a tool-input map; tolerant of missing/odd shapes. */
    public static List<String> stringList(Map<String, JsonValue> input, String key) {
        JsonValue v = input.get(key);
        if (v == null) {
            return List.of();
        }
        Optional<? extends List<?>> arr = v.asArray();
        if (arr.isEmpty()) {
            return List.of();
        }
        return arr.get().stream()
                .map(Object::toString)
                .map(StructuredCall::stripQuotes)
                .filter(s -> !s.isBlank())
                .map(StructuredCall::unescape)
                .toList();
    }

    public static boolean bool(Map<String, JsonValue> input, String key, boolean fallback) {
        JsonValue v = input.get(key);
        if (v == null) {
            return fallback;
        }
        String raw = v.toString().trim();
        if ("true".equalsIgnoreCase(raw)) {
            return true;
        }
        if ("false".equalsIgnoreCase(raw)) {
            return false;
        }
        return fallback;
    }

    private static String stripQuotes(String raw) {
        String s = raw.trim();
        if (s.length() >= 2 && s.startsWith("\"") && s.endsWith("\"")) {
            return s.substring(1, s.length() - 1);
        }
        return s;
    }

    private static String unescape(String s) {
        return s.replace("\\n", "\n").replace("\\\"", "\"").replace("\\/", "/");
    }
}

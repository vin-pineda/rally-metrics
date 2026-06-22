package com.rm.rally_metrics.prediction;

/**
 * A fantasy-draft recommendation tier derived deterministically from a player's model skill
 * rating — so the verdict is grounded in the same math as the predictions, always consistent,
 * and free (no LLM call). Serialized by name (e.g. {@code "STRONG_DRAFT"}); the UI maps each
 * tier to a label and colour.
 */
public enum DraftTier {
    STRONG_DRAFT("Strong Draft"),
    SOLID("Solid"),
    FLEX("Flex"),
    AVOID("Avoid");

    private final String label;

    DraftTier(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}

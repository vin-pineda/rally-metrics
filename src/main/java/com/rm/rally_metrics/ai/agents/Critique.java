package com.rm.rally_metrics.ai.agents;

import java.util.List;

/**
 * Verdict from the {@link CriticAgent}: whether the analyst's narrative is fully supported by the
 * supplied facts, plus any specific issues to fix on revision.
 *
 * @param approved true if the narrative is grounded and may be returned as-is
 * @param issues   concrete problems (unsupported claims, contradicted numbers) when not approved
 */
public record Critique(boolean approved, List<String> issues) {

    /** Default to approving when the critic itself is unavailable — never block on the critic. */
    public static Critique approvedByDefault() {
        return new Critique(true, List.of());
    }
}

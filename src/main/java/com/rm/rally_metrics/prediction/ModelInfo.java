package com.rm.rally_metrics.prediction;

import java.util.List;

/**
 * Self-describing, read-only documentation of how predictions are produced. Served at
 * {@code GET /api/v1/model/info} so reviewers can audit the methodology — the deterministic
 * probability model and the multi-agent narrative layer — without reading the source.
 *
 * <p>Serialized snake_case (e.g. {@code probability_model}, {@code agent_pipeline}).
 */
public record ModelInfo(
        String version,
        String name,
        String summary,
        ProbabilityModel probabilityModel,
        AgentPipeline agentPipeline,
        List<String> limits) {

    public record ProbabilityModel(
            String method,
            List<String> features,
            List<String> guarantees,
            String confidence) {
    }

    public record AgentPipeline(
            String description,
            List<Agent> agents,
            String guardrail) {
    }

    public record Agent(String role, String model, String output) {
    }
}

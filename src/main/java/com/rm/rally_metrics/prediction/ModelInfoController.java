package com.rm.rally_metrics.prediction;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes a transparent, read-only description of the prediction methodology at
 * {@code GET /api/v1/model/info}. Static content kept in lock-step with
 * {@link MatchProbabilityModel} (it reuses the model's version + constants where they are public).
 */
@RestController
@RequestMapping("/api/v1/model")
public class ModelInfoController {

    @GetMapping("/info")
    public ModelInfo info() {
        return new ModelInfo(
                MatchProbabilityModel.MODEL_VERSION,
                "Rally Metrics Match Model",
                "A deterministic head-to-head win-probability model with a multi-agent narrative layer. "
                        + "All numbers (probability, moneyline, confidence, key factors) are computed by the "
                        + "model; the language models only narrate and scout — they never compute the numbers.",
                new ModelInfo.ProbabilityModel(
                        "Pythagorean point-expectation + empirical-Bayes shrinkage + sample-size regression "
                                + "+ log5 head-to-head + book overround",
                        List.of(
                                "Pythagorean point win expectation (exponent "
                                        + (int) MatchProbabilityModel.PYTHAGOREAN_EXPONENT + ")",
                                "Game win rate shrunk toward 0.5 (Beta pseudo-count "
                                        + (int) MatchProbabilityModel.GAME_PRIOR_PSEUDOCOUNT + ")",
                                "Blend " + (int) (MatchProbabilityModel.WEIGHT_POINTS * 100) + "% points / "
                                        + (int) (MatchProbabilityModel.WEIGHT_GAMES * 100) + "% games",
                                "Skill regressed toward 0.5 by sample size (half-life "
                                        + (int) MatchProbabilityModel.CONFIDENCE_HALF_GAMES + " games)",
                                "log5 converts the two skills to a symmetric head-to-head probability",
                                (int) (MatchProbabilityModel.VIG * 100) + "% overround applied before moneyline odds"),
                        List.of(
                                "Probabilities lie strictly in (0,1)",
                                "Symmetric: P(A beats B) = 1 - P(B beats A)",
                                "Monotonic in each player's skill",
                                "Numerically stable at the 0-games, 0-points, and equal-skill edges"),
                        "LOW / MEDIUM / HIGH, driven by the smaller player's game sample"),
                new ModelInfo.AgentPipeline(
                        "Two Scout agents run in parallel, a Head Analyst synthesizes their reports with the "
                                + "model output, and a Critic verifies the narrative is grounded (one bounded revision).",
                        List.of(
                                new ModelInfo.Agent("Scout (x2, parallel)", "claude-haiku-4-5",
                                        "structured per-player scouting report"),
                                new ModelInfo.Agent("Head Analyst", "claude-sonnet-4-6",
                                        "grounded two-paragraph matchup narrative"),
                                new ModelInfo.Agent("Critic", "claude-haiku-4-5",
                                        "grounding review; forces one revision if any claim is unsupported")),
                        "The language models never compute or override the numbers — they narrate the "
                                + "deterministic model's output and are fact-checked against it."),
                List.of(
                        "No head-to-head history, court surface, or recency weighting",
                        "Pythagorean exponent and feature weights are fixed priors, not fit from match outcomes",
                        "Uses season-aggregate statistics only"));
    }
}

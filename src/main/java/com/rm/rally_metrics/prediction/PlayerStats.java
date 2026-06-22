package com.rm.rally_metrics.prediction;

/**
 * Minimal, framework-free view of the statistics the match model needs. Decoupling
 * the model from the JPA {@code Player} entity keeps the math pure and trivially testable.
 */
public record PlayerStats(int gamesWon, int gamesLost, int pointsWon, int pointsLost) {

    public int games() {
        return gamesWon + gamesLost;
    }

    public int points() {
        return pointsWon + pointsLost;
    }
}

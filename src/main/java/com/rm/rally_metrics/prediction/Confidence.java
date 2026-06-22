package com.rm.rally_metrics.prediction;

/**
 * Qualitative confidence in a match estimate, driven by the smaller player's sample size.
 * A prediction built on a handful of games is inherently less trustworthy than one built
 * on a full season, regardless of how lopsided the point totals look.
 */
public enum Confidence {
    LOW,
    MEDIUM,
    HIGH
}

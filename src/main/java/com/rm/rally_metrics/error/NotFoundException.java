package com.rm.rally_metrics.error;

/**
 * Thrown when a requested resource (e.g. a player) does not exist.
 * Surfaced as HTTP 404 by {@link GlobalExceptionHandler}.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}

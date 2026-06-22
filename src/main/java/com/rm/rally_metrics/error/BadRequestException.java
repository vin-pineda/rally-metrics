package com.rm.rally_metrics.error;

/**
 * Thrown when client input is missing or invalid.
 * Surfaced as HTTP 400 by {@link GlobalExceptionHandler}.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

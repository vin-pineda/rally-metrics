package com.rm.rally_metrics.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Lazily builds and shares one {@link AnthropicClient} across the AI/agent layer.
 *
 * <p>Lazy construction lets every agent bean be created even when no {@code ANTHROPIC_API_KEY}
 * is present (e.g. Spring tests where the agents are mocked), and centralizes the client config
 * (env-resolved key, request timeout, and the SDK's exponential-backoff retries) in one place.
 */
@Component
public class AnthropicClientProvider {

    private volatile AnthropicClient client;

    public AnthropicClient get() {
        AnthropicClient c = client;
        if (c == null) {
            synchronized (this) {
                c = client;
                if (c == null) {
                    // SDK retries transient failures (408/409/429/5xx + IO) with exponential backoff.
                    c = AnthropicOkHttpClient.builder()
                            .fromEnv()
                            .timeout(Duration.ofSeconds(60))
                            .maxRetries(3)
                            .build();
                    client = c;
                }
            }
        }
        return c;
    }
}

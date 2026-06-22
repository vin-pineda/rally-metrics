package com.rm.rally_metrics;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    /**
     * Allowed CORS origin patterns, configurable via the {@code rally.cors.allowed-origins}
     * property (env: {@code RALLY_CORS_ALLOWED_ORIGINS}, comma-separated). Patterns support
     * {@code *} wildcards, which is important because Vercel assigns a fresh hostname to every
     * deployment (e.g. {@code rally-metrics-<hash>-<team>.vercel.app}); a single
     * {@code https://*.vercel.app} pattern keeps preview + production builds working without
     * chasing exact URLs. Defaults to the local dev frontend plus the Vercel + custom domains.
     */
    @Value("${rally.cors.allowed-origins:http://localhost:3000,http://localhost:3001,https://*.vercel.app,https://www.rallymetrics.com,https://rallymetrics.com}")
    private String[] allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns(allowedOrigins)
                        .allowedMethods("GET", "POST")
                        .allowedHeaders("Content-Type", "Accept");
            }
        };
    }
}

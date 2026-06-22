package com.rm.rally_metrics;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    /**
     * Allowed CORS origins, configurable via the {@code rally.cors.allowed-origins}
     * property (env: {@code RALLY_CORS_ALLOWED_ORIGINS}, comma-separated). Defaults
     * to the local dev frontend plus the production domains.
     */
    @Value("${rally.cors.allowed-origins:http://localhost:3000,https://rally-metrics.vercel.app,https://www.rallymetrics.com,https://rallymetrics.com}")
    private String[] allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(allowedOrigins)
                        .allowedMethods("GET", "POST")
                        .allowedHeaders("Content-Type", "Accept");
            }
        };
    }
}

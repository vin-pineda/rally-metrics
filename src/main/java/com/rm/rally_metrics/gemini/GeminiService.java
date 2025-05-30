package com.rm.rally_metrics.gemini;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    public String generatePlayerSummary(String name, String team, String recentStats, String styleHint) {
        String prompt = String.format("""
        You are an expert fantasy sports analyst. Provide a short 3-paragraph fantasy profile for a Major League Pickleball player named %s on the team %s.

        1. Describe their playstyle and summarize their overall performance briefly.
        2. Summarize their recent match outcomes (without specific scores or stats) using a few short sentences.
        3. End with a sentence starting ONLY with: "You should..." to tell a fantasy user if they should draft this player.

        Style hint: %s
        Match record summary: %s

        Keep the tone informative and focused. No bullet points. Do not include game scores. Do not say "Yes" or "No" to start the recommendation — ONLY begin the final sentence with "You should".
        """, name, team, styleHint, recentStats);

        try {
            Map<String, Object> content = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(content, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_URL, entity, String.class);

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> body = mapper.readValue(response.getBody(), Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            Map<String, Object> contentMap = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");

            return parts.get(0).get("text").toString();

        } catch (HttpClientErrorException e) {
            System.err.println("Gemini API error:");
            System.err.println("Status: " + e.getStatusCode());
            System.err.println("Body: " + e.getResponseBodyAsString());
            return "Error: Gemini API call failed.";
        } catch (Exception e) {
            System.err.println("Unexpected error:");
            e.printStackTrace();
            return "Error: Unable to generate summary.";
        }
    }
}

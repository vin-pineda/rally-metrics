package com.rm.rally_metrics.gemini;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public String generatePlayerSummary(String name, String team, String recentStats, String styleHint) {
        String prompt = String.format("""
                    Give a short 1-paragraph summary of this pickleball player named %s from the team %s. 
                    Describe their playing style and summarize their most recent performance: %s. 
                    Style hint: %s.
                """, name, team, recentStats, styleHint);

        System.out.println("Sending request to Gemini for: " + name);
        System.out.println("Prompt:\n" + prompt);
        System.out.println("API KEY: " + apiKey); // debug

        try {
            Map<String, Object> content = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(content, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL, entity, Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");

            return parts.get(0).get("text").toString();

        } catch (Exception e) {
            System.err.println("Gemini API Error:");
            e.printStackTrace();
            return "Error generating summary from Gemini API.";
        }
    }
}
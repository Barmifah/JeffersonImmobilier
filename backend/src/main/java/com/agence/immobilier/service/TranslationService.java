package com.agence.immobilier.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TranslationService {
    private final RestClient restClient = RestClient.create();

    public String translate(String text) {
        if (text == null || text.isBlank()) return "";
        if (text.length() <= 450) return translateChunk(text);
        StringBuilder translated = new StringBuilder();
        String[] words = text.trim().split("\\s+");
        StringBuilder chunk = new StringBuilder();
        for (String word : words) {
            if (chunk.length() > 0 && chunk.length() + word.length() + 1 > 450) {
                appendTranslatedChunk(translated, chunk.toString());
                chunk.setLength(0);
            }
            if (chunk.length() > 0) chunk.append(' ');
            chunk.append(word);
        }
        if (chunk.length() > 0) appendTranslatedChunk(translated, chunk.toString());
        return translated.toString();
    }

    private void appendTranslatedChunk(StringBuilder target, String chunk) {
        if (target.length() > 0) target.append(' ');
        target.append(translateChunk(chunk));
    }

    private String translateChunk(String text) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("api.mymemory.translated.net")
                            .path("/get")
                            .queryParam("q", text)
                            .queryParam("langpair", "fr|en")
                            .build())
                            .header("User-Agent", "JeffersonImmobilier/1.0")
                    .retrieve()
                    .body(JsonNode.class);
            String translatedText = response == null
                    ? null
                    : response.path("responseData").path("translatedText").asText(null);
            int responseStatus = response == null ? 0 : response.path("responseStatus").asInt(0);
            if (responseStatus >= 400 || translatedText == null || translatedText.isBlank()) {
                throw new IllegalStateException("Translation response is empty");
            }
            return translatedText;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Service de traduction indisponible", exception);
        }
    }
}

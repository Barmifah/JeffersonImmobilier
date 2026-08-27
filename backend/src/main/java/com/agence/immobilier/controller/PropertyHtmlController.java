package com.agence.immobilier.controller;

import com.agence.immobilier.entity.Property;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.repository.PropertyRepository;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
public class PropertyHtmlController {
    private final PropertyRepository propertyRepository;
    private final String siteUrl;

    public PropertyHtmlController(PropertyRepository propertyRepository,
                                  @Value("${seo.site-url:https://jefferson-immobilier.example}") String siteUrl) {
        this.propertyRepository = propertyRepository;
        this.siteUrl = siteUrl.replaceAll("/$", "");
    }

    @GetMapping(value = "/biens/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    public String property(@PathVariable String slug) {
        Property property = propertyRepository.findBySlug(slug)
                .filter(item -> item.getStatus() == PropertyStatus.AVAILABLE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bien introuvable"));
        String url = siteUrl + "/biens/" + escape(property.getSlug());
        String description = property.getDescription();
        String image = property.getImages().stream().findFirst().map(item -> item.getSecureUrl()).orElse("");
        String schema = "{\"@context\":\"https://schema.org\",\"@type\":\"Residence\",\"name\":\"" + escapeJson(property.getTitle())
                + "\",\"description\":\"" + escapeJson(description) + "\",\"url\":\"" + url
                + "\",\"image\":\"" + escapeJson(image) + "\",\"offers\":{\"@type\":\"Offer\",\"price\":\""
                + property.getPrice() + "\",\"priceCurrency\":\"" + escapeJson(property.getCurrency()) + "\"}}";
        String images = property.getImages().stream().map(item -> "<img src=\"" + escape(item.getSecureUrl()) + "\" alt=\"" + escape(property.getTitle()) + "\">").collect(Collectors.joining());
        return "<!doctype html><html lang=\"fr\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>"
                + escape(property.getTitle()) + " | Jefferson Immobilier</title><meta name=\"description\" content=\"" + escape(description)
                + "\"><meta property=\"og:type\" content=\"website\"><meta property=\"og:title\" content=\"" + escape(property.getTitle())
                + "\"><meta property=\"og:description\" content=\"" + escape(description) + "\"><meta property=\"og:image\" content=\""
                + escape(image) + "\"><link rel=\"canonical\" href=\"" + url + "\"><script type=\"application/ld+json\">" + schema
                + "</script></head><body><main><nav><a href=\"/\">Accueil</a> · <a href=\"/acheter\">Annonces</a></nav><h1>"
                + escape(property.getTitle()) + "</h1><p>" + escape(property.getCity()) + " · " + property.getPrice() + " "
                + escape(property.getCurrency()) + "</p><p>" + escape(description) + "</p><section>" + images
                + "</section><a href=\"/contact\">Demander une visite</a></main></body></html>";
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}

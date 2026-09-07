package com.agence.immobilier.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",                       // Votre environnement de dev local
                        "https://www.jeffersonimmobilier.bf",          // Votre domaine de production principal
                        "https://jeffersonimmobilier.bf"               // Sécurité si l'utilisateur oublie les www
                )
                // Permet d'autoriser automatiquement toutes les URL de test/preview générées par Vercel
                .allowedOriginPatterns("https://*-*.vercel.app")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                // Optionnel mais recommandé : met en cache la réponse CORS pendant 1 heure (3600 secondes) 
                // pour accélérer les requêtes du navigateur de vos clients
                .maxAge(3600);
    }
}

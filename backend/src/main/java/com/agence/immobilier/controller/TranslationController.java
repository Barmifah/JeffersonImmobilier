package com.agence.immobilier.controller;

import com.agence.immobilier.dto.request.TranslationRequest;
import com.agence.immobilier.dto.response.TranslationResponse;
import com.agence.immobilier.service.TranslationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/translation")
public class TranslationController {
    private final TranslationService translationService;

    public TranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public TranslationResponse translate(@Valid @RequestBody TranslationRequest request) {
        return new TranslationResponse(
                translationService.translate(request.title()),
                translationService.translate(request.description()));
    }
}

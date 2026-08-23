package com.agence.immobilier.controller;

import com.agence.immobilier.dto.request.InquiryRequest;
import com.agence.immobilier.service.InquiryService;
import com.agence.immobilier.entity.InquiryStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {
    private final InquiryService inquiryService;

    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@Valid @RequestBody InquiryRequest request) {
        inquiryService.create(request);
    }

    @PatchMapping("/{id}/status")
    public com.agence.immobilier.dto.response.InquiryResponse updateStatus(@PathVariable Long id,
                                                                            @RequestParam InquiryStatus status) {
        return inquiryService.updateStatus(id, status);
    }
}

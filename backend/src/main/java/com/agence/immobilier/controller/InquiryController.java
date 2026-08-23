package com.agence.immobilier.controller;

import com.agence.immobilier.dto.request.InquiryRequest;
import com.agence.immobilier.dto.response.InquiryResponse;
import com.agence.immobilier.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

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

    @GetMapping
    public List<InquiryResponse> findAll() {
        return inquiryService.findAll();
    }
}

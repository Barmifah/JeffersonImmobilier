package com.agence.immobilier.controller;

import com.agence.immobilier.dto.request.ContactMessageRequest;
import com.agence.immobilier.dto.response.ContactMessageResponse;
import com.agence.immobilier.service.ContactMessageService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact-messages")
public class ContactMessageController {
    private final ContactMessageService contactMessageService;

    public ContactMessageController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse create(@Valid @RequestBody ContactMessageRequest request) {
        return contactMessageService.create(request);
    }

    @GetMapping
    public List<ContactMessageResponse> findAll() {
        return contactMessageService.findAll();
    }

    @PatchMapping("/{id}/status")
    public ContactMessageResponse updateStatus(@PathVariable Long id, @RequestParam String status) {
        return contactMessageService.updateStatus(id, status);
    }
}

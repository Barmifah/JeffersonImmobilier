package com.agence.immobilier.service;

import com.agence.immobilier.dto.request.ContactMessageRequest;
import com.agence.immobilier.dto.response.ContactMessageResponse;
import com.agence.immobilier.entity.ContactMessage;
import com.agence.immobilier.repository.ContactMessageRepository;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@SuppressWarnings("null")
public class ContactMessageService {
    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional
    public ContactMessageResponse create(ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setFullName(request.fullName());
        message.setEmail(request.email());
        message.setPhone(request.phone());
        message.setProject(request.project());
        message.setMessage(request.message());
        return toResponse(contactMessageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<ContactMessageResponse> findAll() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ContactMessageResponse updateStatus(Long id, String status) {
        if (!Set.of("NEW", "CONTACTED", "CLOSED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut de message invalide");
        }
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message introuvable"));
        message.setStatus(status);
        return toResponse(message);
    }

    private ContactMessageResponse toResponse(ContactMessage message) {
        return new ContactMessageResponse(message.getId(), message.getFullName(), message.getEmail(), message.getPhone(),
                message.getProject(), message.getMessage(), message.getStatus(), message.getCreatedAt());
    }
}

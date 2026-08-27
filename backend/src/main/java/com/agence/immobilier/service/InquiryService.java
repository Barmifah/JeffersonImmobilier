package com.agence.immobilier.service;

import com.agence.immobilier.dto.request.InquiryRequest;
import com.agence.immobilier.dto.response.InquiryResponse;
import com.agence.immobilier.entity.PropertyInquiry;
import com.agence.immobilier.entity.InquiryStatus;
import com.agence.immobilier.repository.PropertyInquiryRepository;
import com.agence.immobilier.repository.PropertyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@SuppressWarnings("null")
public class InquiryService {
    private final PropertyRepository propertyRepository;
    private final PropertyInquiryRepository inquiryRepository;

    public InquiryService(PropertyRepository propertyRepository, PropertyInquiryRepository inquiryRepository) {
        this.propertyRepository = propertyRepository;
        this.inquiryRepository = inquiryRepository;
    }

    @Transactional
    public void create(InquiryRequest request) {
        PropertyInquiry inquiry = new PropertyInquiry();
        if (request.propertyId() != null) {
            var property = propertyRepository.findById(request.propertyId())
                .filter(item -> item.getStatus().name().equals("AVAILABLE"))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bien introuvable"));
            inquiry.setProperty(property);
        }
        inquiry.setFullName(request.fullName());
        inquiry.setEmail(request.email());
        inquiry.setPhone(request.phone());
        inquiry.setMessage(request.message());
        inquiryRepository.save(inquiry);
    }

    @Transactional(readOnly = true)
    public List<InquiryResponse> findAllForAdmin() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(inquiry -> new InquiryResponse(inquiry.getId(), inquiry.getProperty() == null ? null : inquiry.getProperty().getTitle(),
                    inquiry.getProperty() == null ? null : inquiry.getProperty().getReference(), inquiry.getFullName(), inquiry.getEmail(),
                        inquiry.getPhone(), inquiry.getMessage(), inquiry.getStatus(), inquiry.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public long countByStatus(com.agence.immobilier.entity.InquiryStatus status) {
        return inquiryRepository.countByStatus(status);
    }

    @Transactional
    public InquiryResponse updateStatus(Long id, InquiryStatus status) {
        var inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
        inquiry.setStatus(status);
        return new InquiryResponse(inquiry.getId(), inquiry.getProperty() == null ? null : inquiry.getProperty().getTitle(),
                inquiry.getProperty() == null ? null : inquiry.getProperty().getReference(), inquiry.getFullName(),
                inquiry.getEmail(), inquiry.getPhone(), inquiry.getMessage(), inquiry.getStatus(), inquiry.getCreatedAt());
    }
}

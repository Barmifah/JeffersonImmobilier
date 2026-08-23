package com.agence.immobilier.dto.response;

import com.agence.immobilier.entity.InquiryStatus;
import java.time.Instant;

public record InquiryResponse(Long id, String propertyTitle, String propertyReference, String fullName,
                              String email, String phone, String message, InquiryStatus status,
                              Instant createdAt) {
}
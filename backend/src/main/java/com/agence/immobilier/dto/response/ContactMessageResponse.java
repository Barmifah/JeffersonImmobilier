package com.agence.immobilier.dto.response;

import java.time.Instant;

public record ContactMessageResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String project,
        String message,
        String status,
        Instant createdAt
) {
}

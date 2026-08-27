package com.agence.immobilier.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactMessageRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        String phone,
        String project,
        @NotBlank String message
) {
}

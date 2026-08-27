package com.agence.immobilier.dto.request;

import jakarta.validation.constraints.NotBlank;

public record WebsiteSettingRequest(@NotBlank String value) {
}

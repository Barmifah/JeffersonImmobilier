package com.agence.immobilier.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SocialLinkRequest(
        @NotBlank String network,
        @NotBlank String url,
        boolean enabled
) {
}

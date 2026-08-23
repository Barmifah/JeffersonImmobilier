package com.agence.immobilier.dto.response;

public record AuthResponse(String token, String tokenType, long expiresIn) {
}

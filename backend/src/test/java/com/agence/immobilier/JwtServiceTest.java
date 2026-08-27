package com.agence.immobilier;

import static org.assertj.core.api.Assertions.assertThat;

import com.agence.immobilier.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class JwtServiceTest {
    private static final String SECRET = "VGhlSmVmZmVyc29uSW1tb2JpbGllcl9kZXZlbG9wbWVudF9zZWNyZXRfa2V5XzMyX2J5dGVz";

    private final JwtService jwtService = new JwtService(SECRET, 60_000, 120_000);
    private final UserDetails user = User.withUsername("admin@example.com").password("password").roles("ADMIN").build();

    @Test
    void accessTokenIsValidAndRefreshTokenIsNotAnAccessToken() {
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        assertThat(jwtService.isValid(accessToken, user)).isTrue();
        assertThat(jwtService.isValid(refreshToken, user)).isFalse();
        assertThat(jwtService.isRefreshToken(refreshToken, user)).isTrue();
    }
}

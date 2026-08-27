package com.agence.immobilier.security;

import com.agence.immobilier.dto.request.LoginRequest;
import com.agence.immobilier.dto.response.AuthResponse;
import com.agence.immobilier.entity.User;
import com.agence.immobilier.repository.UserRepository;
import java.util.stream.Collectors;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, @Lazy AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        UserDetails user = loadUserByUsername(request.email());
        return new AuthResponse(jwtService.generateToken(user), "Bearer", jwtService.getExpirationMs(), jwtService.generateRefreshToken(user));
    }

    public AuthResponse refresh(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        UserDetails user = loadUserByUsername(email);
        if (!jwtService.isRefreshToken(refreshToken, user)) {
            throw new org.springframework.security.authentication.BadCredentialsException("Refresh token invalide");
        }
        return new AuthResponse(jwtService.generateToken(user), "Bearer", jwtService.getExpirationMs(), jwtService.generateRefreshToken(user));
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), user.isEnabled(), true, true, true,
                user.getRoles().stream().map(role -> new SimpleGrantedAuthority("ROLE_" + role.name())).collect(Collectors.toSet()));
    }
}

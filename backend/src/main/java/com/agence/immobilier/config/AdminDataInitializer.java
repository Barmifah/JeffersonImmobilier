package com.agence.immobilier.config;

import com.agence.immobilier.entity.Role;
import com.agence.immobilier.entity.User;
import com.agence.immobilier.repository.UserRepository;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataInitializer {
    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  @Value("${ADMIN_EMAIL:admin@jefferson-immobilier.local}") String email,
                                  @Value("${ADMIN_PASSWORD:ChangeMe-Jefferson-2026}") String password) {
        return args -> {
            if (userRepository.findByEmail(email).isEmpty()) {
                User admin = new User();
                admin.setEmail(email);
                admin.setPassword(passwordEncoder.encode(password));
                admin.setRoles(Set.of(Role.ADMIN));
                admin.setEnabled(true);
                userRepository.save(admin);
            }
        };
    }
}

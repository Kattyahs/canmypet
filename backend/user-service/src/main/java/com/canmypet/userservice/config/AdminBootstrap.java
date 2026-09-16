package com.canmypet.userservice.config;

import com.canmypet.userservice.model.Role;
import com.canmypet.userservice.model.User;
import com.canmypet.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        boolean anyAdminExists = userRepository.existsByRole(Role.ADMIN);

        if (anyAdminExists) {
            return;
        }

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("No ADMIN account exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set. " +
                    "No admin will be created automatically.");
            return;
        }

        User admin = User.builder()
                .name("CanMyPet Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .verified(true)
                .build();

        userRepository.save(admin);
        log.info("Bootstrap admin account created for email: {}", adminEmail);
    }
}
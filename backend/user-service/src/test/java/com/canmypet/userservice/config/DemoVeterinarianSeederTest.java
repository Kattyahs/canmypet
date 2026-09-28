package com.canmypet.userservice.config;

import com.canmypet.userservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Timestamp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoVeterinarianSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Test
    void run_whenDemoVeterinarianAlreadyExists_doesNothing() {
        when(userRepository.existsById(DemoVeterinarianSeeder.DEMO_VETERINARIAN_ID)).thenReturn(true);

        seeder("secret123").run();

        verifyNoInteractions(jdbcTemplate, passwordEncoder);
    }

    @Test
    void run_whenEmailIsTakenByAnotherAccount_doesNotInsert() {
        when(userRepository.existsById(DemoVeterinarianSeeder.DEMO_VETERINARIAN_ID)).thenReturn(false);
        when(userRepository.existsByEmail(DemoVeterinarianSeeder.DEMO_VETERINARIAN_EMAIL)).thenReturn(true);

        seeder("secret123").run();

        verifyNoInteractions(jdbcTemplate, passwordEncoder);
    }

    @Test
    void run_withDemoPassword_insertsVerifiedVeterinarianWithFixedId() {
        when(userRepository.existsById(DemoVeterinarianSeeder.DEMO_VETERINARIAN_ID)).thenReturn(false);
        when(userRepository.existsByEmail(DemoVeterinarianSeeder.DEMO_VETERINARIAN_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded");

        seeder("secret123").run();

        verify(jdbcTemplate).update(
                startsWith("INSERT INTO users"),
                eq(DemoVeterinarianSeeder.DEMO_VETERINARIAN_ID),
                eq(DemoVeterinarianSeeder.DEMO_VETERINARIAN_NAME),
                eq(DemoVeterinarianSeeder.DEMO_VETERINARIAN_EMAIL),
                eq("encoded"),
                eq("VETERINARIAN"),
                eq(DemoVeterinarianSeeder.DEMO_LICENSE_NUMBER),
                eq(true),
                any(Timestamp.class));
    }

    @Test
    void run_withoutDemoPassword_usesRandomPassword() {
        when(userRepository.existsById(DemoVeterinarianSeeder.DEMO_VETERINARIAN_ID)).thenReturn(false);
        when(userRepository.existsByEmail(DemoVeterinarianSeeder.DEMO_VETERINARIAN_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        seeder("  ").run();

        ArgumentCaptor<String> rawPassword = ArgumentCaptor.forClass(String.class);
        verify(passwordEncoder).encode(rawPassword.capture());
        assertThat(rawPassword.getValue()).isNotBlank().hasSizeGreaterThanOrEqualTo(32);
        verify(jdbcTemplate).update(
                startsWith("INSERT INTO users"),
                eq(DemoVeterinarianSeeder.DEMO_VETERINARIAN_ID),
                eq(DemoVeterinarianSeeder.DEMO_VETERINARIAN_NAME),
                eq(DemoVeterinarianSeeder.DEMO_VETERINARIAN_EMAIL),
                eq("encoded"),
                eq("VETERINARIAN"),
                eq(DemoVeterinarianSeeder.DEMO_LICENSE_NUMBER),
                eq(true),
                any(Timestamp.class));
    }

    private DemoVeterinarianSeeder seeder(String demoPassword) {
        return new DemoVeterinarianSeeder(userRepository, passwordEncoder, jdbcTemplate, demoPassword);
    }
}

package com.canmypet.userservice.service;

import com.canmypet.userservice.dto.AuthResponse;
import com.canmypet.userservice.dto.RegisterRequest;
import com.canmypet.userservice.model.Role;
import com.canmypet.userservice.model.User;
import com.canmypet.userservice.repository.UserRepository;
import com.canmypet.userservice.security.JwtService;
import com.canmypet.userservice.exception.EmailAlreadyExistsException;
import com.canmypet.userservice.dto.LoginRequest;
import com.canmypet.userservice.exception.InvalidCredentialsException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_withNewEmail_createsUserAndReturnsToken() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setName("Kattya Herrera");
        request.setEmail("kattya@example.com");
        request.setPassword("password123");
        request.setRole(Role.OWNER);

        when(userRepository.existsByEmail("kattya@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");

        User savedUser = User.builder()
                .id(1L)
                .name("Kattya Herrera")
                .email("kattya@example.com")
                .password("hashed_password")
                .role(Role.OWNER)
                .verified(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(1L, "kattya@example.com", "OWNER")).thenReturn("fake-jwt-token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("kattya@example.com");
        assertThat(response.getRole()).isEqualTo(Role.OWNER);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withExistingEmail_throwsEmailAlreadyExistsException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setName("Kattya Herrera");
        request.setEmail("kattya@example.com");
        request.setPassword("password123");
        request.setRole(Role.OWNER);

        when(userRepository.existsByEmail("kattya@example.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("kattya@example.com");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_withValidCredentials_returnsToken() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("kattya@example.com");
        request.setPassword("password123");

        User existingUser = User.builder()
                .id(1L)
                .name("Kattya Herrera")
                .email("kattya@example.com")
                .password("hashed_password")
                .role(Role.OWNER)
                .verified(true)
                .build();

        when(userRepository.findByEmail("kattya@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(jwtService.generateToken(1L, "kattya@example.com", "OWNER")).thenReturn("fake-jwt-token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getUserId()).isEqualTo(1L);
    }

    @Test
    void login_withWrongPassword_throwsInvalidCredentialsException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("kattya@example.com");
        request.setPassword("wrongpassword");

        User existingUser = User.builder()
                .id(1L)
                .email("kattya@example.com")
                .password("hashed_password")
                .role(Role.OWNER)
                .build();

        when(userRepository.findByEmail("kattya@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongpassword", "hashed_password")).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_withNonExistentEmail_throwsInvalidCredentialsException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("noexiste@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("noexiste@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
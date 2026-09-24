package com.canmypet.userservice.service;

import com.canmypet.userservice.dto.UpdateUserRequest;
import com.canmypet.userservice.dto.UserResponse;
import com.canmypet.userservice.exception.EmailAlreadyExistsException;
import com.canmypet.userservice.exception.UserNotFoundException;
import com.canmypet.userservice.model.Role;
import com.canmypet.userservice.model.User;
import com.canmypet.userservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.canmypet.userservice.dto.PageResponse;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getUserById_existingId_returnsUser() {
        User user = User.builder()
                .id(1L)
                .name("Kattya Herrera")
                .email("kattya@example.com")
                .role(Role.OWNER)
                .verified(true)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserResponse response = userService.getUserById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("kattya@example.com");
    }

    @Test
    void getUserById_nonExistentId_throwsUserNotFoundException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(999L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void updateUser_emailAlreadyTaken_throwsEmailAlreadyExistsException() {
        User existingUser = User.builder()
                .id(1L)
                .name("Kattya")
                .email("kattya@example.com")
                .role(Role.OWNER)
                .build();

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("otro@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("otro@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUser(1L, request))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyVeterinarian_withVeterinarianRole_marksAsVerified() {
        User vet = User.builder()
                .id(2L)
                .name("Dr. Vet")
                .email("vet@example.com")
                .role(Role.VETERINARIAN)
                .verified(false)
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(vet));
        when(userRepository.save(any(User.class))).thenReturn(vet);

        UserResponse response = userService.verifyVeterinarian(2L);

        assertThat(response.getVerified()).isTrue();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void verifyVeterinarian_withNonVeterinarianRole_throwsIllegalStateException() {
        User owner = User.builder()
                .id(3L)
                .name("Kattya")
                .email("kattya@example.com")
                .role(Role.OWNER)
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(owner));

        assertThatThrownBy(() -> userService.verifyVeterinarian(3L))
                .isInstanceOf(IllegalStateException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUsers_withVerifiedFilter_returnsOnlyMatchingUsers() {
        User pendingVet = User.builder()
                .id(4L)
                .name("Mario Torres")
                .email("mario@example.com")
                .role(Role.VETERINARIAN)
                .licenseNumber("VET-2026-00341")
                .verified(false)
                .build();

        Pageable pageable = PageRequest.of(0, 20);
        when(userRepository.findByRoleAndVerified(Role.VETERINARIAN, false, pageable))
                .thenReturn(new PageImpl<>(List.of(pendingVet), pageable, 1));

        PageResponse<UserResponse> result = userService.getUsers(Role.VETERINARIAN, false, pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).getLicenseNumber()).isEqualTo("VET-2026-00341");
        verify(userRepository, never()).findByRole(any(), any());
    }

    @Test
    void getUsers_withoutVerifiedFilter_returnsEveryUserWithThatRole() {
        Pageable pageable = PageRequest.of(0, 20);
        when(userRepository.findByRole(Role.VETERINARIAN, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        PageResponse<UserResponse> result = userService.getUsers(Role.VETERINARIAN, null, pageable);

        assertThat(result.totalElements()).isZero();
        verify(userRepository, never()).findByRoleAndVerified(any(), any(), any());
    }
}
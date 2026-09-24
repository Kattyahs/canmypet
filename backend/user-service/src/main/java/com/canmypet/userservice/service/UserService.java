package com.canmypet.userservice.service;

import com.canmypet.userservice.dto.UpdateUserRequest;
import com.canmypet.userservice.dto.UserResponse;
import com.canmypet.userservice.exception.EmailAlreadyExistsException;
import com.canmypet.userservice.exception.UserNotFoundException;
import com.canmypet.userservice.model.Role;
import com.canmypet.userservice.model.User;
import com.canmypet.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.canmypet.userservice.dto.PageResponse;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return toResponse(user);
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new EmailAlreadyExistsException(request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    public UserResponse verifyVeterinarian(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (user.getRole() != Role.VETERINARIAN) {
            throw new IllegalStateException("Only veterinarian accounts can be verified");
        }

        user.setVerified(true);
        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    public PageResponse<UserResponse> getUsers(Role role, Boolean verified, Pageable pageable) {
        var page = (verified == null)
                ? userRepository.findByRole(role, pageable)
                : userRepository.findByRoleAndVerified(role, verified, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .licenseNumber(user.getLicenseNumber())
                .verified(user.getVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
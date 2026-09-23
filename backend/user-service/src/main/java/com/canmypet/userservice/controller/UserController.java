package com.canmypet.userservice.controller;

import com.canmypet.userservice.dto.UpdateUserRequest;
import com.canmypet.userservice.dto.UserResponse;
import com.canmypet.userservice.security.CustomUserDetails;
import com.canmypet.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.canmypet.userservice.dto.PageResponse;
import com.canmypet.userservice.model.Role;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<UserResponse>> getUsers(
            @RequestParam Role role,
            @RequestParam(required = false) Boolean verified,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(userService.getUsers(role, verified, pageable));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal CustomUserDetails principal) {
        UserResponse response = userService.getUserById(principal.getUser().getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserResponse response = userService.updateUser(principal.getUser().getId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> verifyVeterinarian(@PathVariable Long id) {
        UserResponse response = userService.verifyVeterinarian(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }
}
package com.canmypet.userservice.dto;

import com.canmypet.userservice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String licenseNumber;
    private Boolean verified;
    private LocalDateTime createdAt;
}
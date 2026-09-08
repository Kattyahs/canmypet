package com.canmypet.foodservice.security;

public record JwtPrincipal(Long userId, String email, String role) {
}
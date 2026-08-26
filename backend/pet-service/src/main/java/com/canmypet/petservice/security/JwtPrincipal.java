package com.canmypet.petservice.security;

public record JwtPrincipal(Long userId, String email, String role) {
}

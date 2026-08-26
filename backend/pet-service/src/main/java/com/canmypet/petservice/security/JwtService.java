package com.canmypet.petservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public JwtPrincipal validateAndExtract(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        if (claims.getExpiration().before(new Date())) {
            throw new io.jsonwebtoken.ExpiredJwtException(null, claims, "Token expired");
        }

        Long userId = claims.get("userId", Long.class);
        String role = claims.get("role", String.class);
        String email = claims.getSubject();

        return new JwtPrincipal(userId, email, role);
    }
}
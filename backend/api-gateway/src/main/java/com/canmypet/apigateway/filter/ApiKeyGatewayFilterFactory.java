package com.canmypet.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.List;

@Component
public class ApiKeyGatewayFilterFactory extends AbstractGatewayFilterFactory<ApiKeyGatewayFilterFactory.Config> {

    public static final String API_KEY_HEADER = "X-API-Key";

    private static final Logger log = LoggerFactory.getLogger(ApiKeyGatewayFilterFactory.class);

    private static final byte[] UNAUTHORIZED_BODY = """
            {"type":"https://canmypet.dev/problems/invalid-api-key","title":"Invalid API key",\
            "status":401,"detail":"Missing or invalid X-API-Key header","code":"INVALID_API_KEY"}"""
            .getBytes(StandardCharsets.UTF_8);

    private final List<byte[]> validKeys;

    public ApiKeyGatewayFilterFactory(@Value("${public-api.keys:}") String keys) {
        super(Config.class);
        this.validKeys = Arrays.stream(keys.split(","))
                .map(String::trim)
                .filter(key -> !key.isEmpty())
                .map(key -> key.getBytes(StandardCharsets.UTF_8))
                .toList();
        if (validKeys.isEmpty()) {
            log.warn("No public API keys configured; every request to the public API will be rejected");
        }
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String providedKey = exchange.getRequest().getHeaders().getFirst(API_KEY_HEADER);
            if (!isValid(providedKey)) {
                return reject(exchange.getResponse());
            }
            ServerWebExchange forwarded = exchange.mutate()
                    .request(request -> request.headers(headers -> headers.remove(API_KEY_HEADER)))
                    .build();
            return chain.filter(forwarded);
        };
    }

    private boolean isValid(String providedKey) {
        if (providedKey == null || providedKey.isEmpty()) {
            return false;
        }
        byte[] provided = providedKey.getBytes(StandardCharsets.UTF_8);
        boolean matches = false;
        for (byte[] validKey : validKeys) {
            matches |= MessageDigest.isEqual(validKey, provided);
        }
        return matches;
    }

    private Mono<Void> reject(ServerHttpResponse response) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_PROBLEM_JSON);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(UNAUTHORIZED_BODY)));
    }

    public static class Config {
    }
}
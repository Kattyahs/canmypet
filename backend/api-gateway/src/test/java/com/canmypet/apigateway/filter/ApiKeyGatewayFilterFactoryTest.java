package com.canmypet.apigateway.filter;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class ApiKeyGatewayFilterFactoryTest {

    private static final String PUBLIC_PATH = "/api/public/v1/foods/safety";

    private final AtomicReference<ServerWebExchange> forwarded = new AtomicReference<>();

    private final GatewayFilterChain chain = exchange -> {
        forwarded.set(exchange);
        return Mono.empty();
    };

    @Test
    void missingKey_returns401WithProblemDetail() {
        MockServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get(PUBLIC_PATH));

        filter("valid-key").filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(exchange.getResponse().getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PROBLEM_JSON);
        assertThat(forwarded.get()).isNull();
    }

    @Test
    void invalidKey_returns401() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get(PUBLIC_PATH).header(ApiKeyGatewayFilterFactory.API_KEY_HEADER, "wrong-key"));

        filter("valid-key").filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(forwarded.get()).isNull();
    }

    @Test
    void validKey_forwardsRequestWithoutApiKeyHeader() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get(PUBLIC_PATH).header(ApiKeyGatewayFilterFactory.API_KEY_HEADER, "valid-key"));

        filter("other-key, valid-key").filter(exchange, chain).block();

        assertThat(forwarded.get()).isNotNull();
        assertThat(forwarded.get().getRequest().getHeaders().containsKey(ApiKeyGatewayFilterFactory.API_KEY_HEADER)).isFalse();
        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void noKeysConfigured_rejectsEveryRequest() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get(PUBLIC_PATH).header(ApiKeyGatewayFilterFactory.API_KEY_HEADER, "anything"));

        filter("").filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(forwarded.get()).isNull();
    }

    private GatewayFilter filter(String keys) {
        return new ApiKeyGatewayFilterFactory(keys).apply(new ApiKeyGatewayFilterFactory.Config());
    }
}
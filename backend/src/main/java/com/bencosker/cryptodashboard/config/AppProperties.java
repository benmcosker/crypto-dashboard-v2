package com.bencosker.cryptodashboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Application settings bound from {@code app.*}. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(String allowedOrigin, int cacheTtlSeconds) {
}

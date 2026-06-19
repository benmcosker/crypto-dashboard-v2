package com.bencosker.cryptodashboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** CoinGecko connection settings bound from {@code coingecko.*}. */
@ConfigurationProperties(prefix = "coingecko")
public record CoinGeckoProperties(String apiKey, String baseUrl) {
}

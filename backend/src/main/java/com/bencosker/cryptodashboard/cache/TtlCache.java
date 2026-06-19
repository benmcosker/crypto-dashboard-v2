package com.bencosker.cryptodashboard.cache;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.bencosker.cryptodashboard.config.AppProperties;

/**
 * Tiny concurrency-safe TTL cache. Smooths CoinGecko demo-plan rate limits and
 * keeps controller tests deterministic. Values are raw JSON strings.
 */
@Component
public class TtlCache {

	private record Entry(String value, long expiresAt) {
	}

	private final ConcurrentHashMap<String, Entry> entries = new ConcurrentHashMap<>();
	private final long ttlMillis;
	private final LongSupplier clock;

	@Autowired
	public TtlCache(AppProperties props) {
		this(props.cacheTtlSeconds() * 1000L, System::currentTimeMillis);
	}

	/** Test constructor with an injectable clock. */
	public TtlCache(long ttlMillis, LongSupplier clock) {
		this.ttlMillis = ttlMillis;
		this.clock = clock;
	}

	public Optional<String> get(String key) {
		Entry entry = entries.get(key);
		if (entry == null || clock.getAsLong() > entry.expiresAt()) {
			return Optional.empty();
		}
		return Optional.of(entry.value());
	}

	public void put(String key, String value) {
		entries.put(key, new Entry(value, clock.getAsLong() + ttlMillis));
	}
}

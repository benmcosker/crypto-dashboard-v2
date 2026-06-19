package com.bencosker.cryptodashboard.cache;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TtlCacheTest {

	@Test
	void returnsStoredValueWhileFresh() {
		TtlCache cache = new TtlCache(60_000, () -> 0L);
		cache.put("k", "v");
		assertThat(cache.get("k")).contains("v");
	}

	@Test
	void missesUnknownKey() {
		TtlCache cache = new TtlCache(60_000, () -> 0L);
		assertThat(cache.get("absent")).isEmpty();
	}

	@Test
	void expiresAfterTtl() {
		long[] now = { 0L };
		TtlCache cache = new TtlCache(1_000, () -> now[0]);
		cache.put("k", "v");

		now[0] = 999;
		assertThat(cache.get("k")).as("fresh just before TTL").contains("v");

		now[0] = 1_001;
		assertThat(cache.get("k")).as("expired after TTL").isEmpty();
	}
}

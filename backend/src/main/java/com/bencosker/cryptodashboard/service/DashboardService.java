package com.bencosker.cryptodashboard.service;

import java.util.function.Supplier;

import org.springframework.stereotype.Service;

import com.bencosker.cryptodashboard.cache.TtlCache;
import com.bencosker.cryptodashboard.client.CoinGeckoClient;

/** Caches CoinGecko responses (raw JSON) behind the dashboard's API. */
@Service
public class DashboardService {

	private final CoinGeckoClient client;
	private final TtlCache cache;

	public DashboardService(CoinGeckoClient client, TtlCache cache) {
		this.client = client;
		this.cache = cache;
	}

	public String markets() {
		return cached("markets", client::markets);
	}

	public String global() {
		return cached("global", client::global);
	}

	public String trending() {
		return cached("trending", client::trending);
	}

	public String exchanges() {
		return cached("exchanges", () -> client.exchanges(10));
	}

	public String chart(String id, String period) {
		int days = TimePeriod.days(period);
		return cached("chart:" + id + ":" + period, () -> client.marketChart(id, days));
	}

	private String cached(String key, Supplier<String> fetch) {
		return cache.get(key).orElseGet(() -> {
			String body = fetch.get();
			cache.put(key, body);
			return body;
		});
	}
}

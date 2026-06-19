package com.bencosker.cryptodashboard.client;

import java.net.SocketTimeoutException;
import java.net.http.HttpTimeoutException;
import java.util.function.UnaryOperator;

import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriBuilder;

/**
 * Thin client over the CoinGecko v3 API. Returns raw JSON strings; shaping is
 * left to the frontend. Non-2xx and transport failures are wrapped in
 * {@link CoinGeckoException}.
 */
@Component
public class CoinGeckoClient {

	private static final String VS_CURRENCY = "usd";

	private final RestClient restClient;

	public CoinGeckoClient(RestClient coinGeckoRestClient) {
		this.restClient = coinGeckoRestClient;
	}

	public String markets() {
		return get("/coins/markets", b -> b
				.queryParam("vs_currency", VS_CURRENCY)
				.queryParam("order", "market_cap_desc")
				.queryParam("per_page", 25)
				.queryParam("page", 1)
				.queryParam("sparkline", true)
				.queryParam("price_change_percentage", "1h,24h,7d,30d"));
	}

	public String global() {
		return get("/global", UnaryOperator.identity());
	}

	public String marketChart(String id, int days) {
		return get("/coins/" + id + "/market_chart", b -> b
				.queryParam("vs_currency", VS_CURRENCY)
				.queryParam("days", days));
	}

	public String trending() {
		return get("/search/trending", UnaryOperator.identity());
	}

	public String exchanges(int perPage) {
		return get("/exchanges", b -> b
				.queryParam("per_page", perPage)
				.queryParam("page", 1));
	}

	private String get(String path, UnaryOperator<UriBuilder> query) {
		try {
			return restClient.get()
					.uri(builder -> query.apply(builder.path(path)).build())
					.retrieve()
					.body(String.class);
		}
		catch (RestClientResponseException ex) {
			throw CoinGeckoException.upstream(ex.getStatusCode().value(), path, ex.getResponseBodyAsString());
		}
		catch (ResourceAccessException ex) {
			Throwable cause = ex.getCause();
			boolean timeout = cause instanceof SocketTimeoutException || cause instanceof HttpTimeoutException;
			throw CoinGeckoException.transport(timeout, ex.getMessage());
		}
	}
}

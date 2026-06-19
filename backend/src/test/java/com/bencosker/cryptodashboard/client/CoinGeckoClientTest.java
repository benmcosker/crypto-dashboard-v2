package com.bencosker.cryptodashboard.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class CoinGeckoClientTest {

	private record Fixture(CoinGeckoClient client, MockRestServiceServer server) {
	}

	private Fixture newClient() {
		RestClient.Builder builder = RestClient.builder().baseUrl("http://localhost");
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		return new Fixture(new CoinGeckoClient(builder.build()), server);
	}

	@Test
	void marketsHitsTheRightPathAndReturnsBody() {
		Fixture f = newClient();
		f.server().expect(requestTo(startsWith("http://localhost/coins/markets")))
				.andExpect(method(HttpMethod.GET))
				.andRespond(withSuccess("[{\"id\":\"bitcoin\"}]", MediaType.APPLICATION_JSON));

		assertThat(f.client().markets()).contains("bitcoin");
		f.server().verify();
	}

	@Test
	void marketChartBuildsPerCoinPathWithDays() {
		Fixture f = newClient();
		f.server().expect(requestTo(startsWith("http://localhost/coins/bitcoin/market_chart")))
				.andRespond(withSuccess("{\"prices\":[]}", MediaType.APPLICATION_JSON));

		assertThat(f.client().marketChart("bitcoin", 90)).contains("prices");
		f.server().verify();
	}

	@Test
	void wrapsUpstreamErrorWithStatusCode() {
		Fixture f = newClient();
		f.server().expect(requestTo(startsWith("http://localhost/global")))
				.andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS)
						.body("{\"error\":\"rate limited\"}")
						.contentType(MediaType.APPLICATION_JSON));

		assertThatThrownBy(() -> f.client().global())
				.isInstanceOfSatisfying(CoinGeckoException.class, ex -> {
					assertThat(ex.statusCode()).isEqualTo(429);
					assertThat(ex.isTransport()).isFalse();
				});
	}
}

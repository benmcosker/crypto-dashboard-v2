package com.bencosker.cryptodashboard.web;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.bencosker.cryptodashboard.client.CoinGeckoException;
import com.bencosker.cryptodashboard.service.DashboardService;

class DashboardControllerTest {

	private DashboardService service;
	private MockMvc mvc;

	@BeforeEach
	void setUp() {
		service = mock(DashboardService.class);
		mvc = MockMvcBuilders.standaloneSetup(new DashboardController(service))
				.setControllerAdvice(new GlobalExceptionHandler())
				.build();
	}

	@Test
	void marketsReturnsJsonBody() throws Exception {
		when(service.markets()).thenReturn("[{\"id\":\"bitcoin\"}]");

		mvc.perform(get("/api/markets"))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(content().string(containsString("bitcoin")));
	}

	@Test
	void chartDefaultsToWeekAndPassesThrough() throws Exception {
		when(service.chart("bitcoin", "week")).thenReturn("{\"prices\":[]}");

		mvc.perform(get("/api/chart/bitcoin"))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString("prices")));
	}

	@Test
	void invalidPeriodReturns400AndSkipsService() throws Exception {
		mvc.perform(get("/api/chart/bitcoin?period=decade"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("invalid_period"))
				.andExpect(jsonPath("$.status").value(400));

		verifyNoInteractions(service);
	}

	@Test
	void rateLimitMapsTo429WithRetryAfter() throws Exception {
		when(service.global()).thenThrow(CoinGeckoException.upstream(429, "/global", "rate limited"));

		mvc.perform(get("/api/global"))
				.andExpect(status().isTooManyRequests())
				.andExpect(header().string("Retry-After", "60"))
				.andExpect(jsonPath("$.code").value("rate_limited"));
	}

	@Test
	void upstreamTimeoutMapsTo504() throws Exception {
		when(service.markets()).thenThrow(CoinGeckoException.transport(true, "timeout"));

		mvc.perform(get("/api/markets"))
				.andExpect(status().isGatewayTimeout())
				.andExpect(jsonPath("$.code").value("upstream_timeout"));
	}

	@Test
	void upstreamErrorMapsTo502() throws Exception {
		when(service.exchanges()).thenThrow(CoinGeckoException.upstream(500, "/exchanges", "boom"));

		mvc.perform(get("/api/exchanges"))
				.andExpect(status().isBadGateway())
				.andExpect(jsonPath("$.code").value("upstream_error"));
	}
}

package com.bencosker.cryptodashboard.web;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bencosker.cryptodashboard.service.DashboardService;
import com.bencosker.cryptodashboard.service.TimePeriod;

/**
 * Dashboard API. Each route proxies a CoinGecko endpoint through the cache and
 * re-emits the JSON, so the API key never reaches the browser.
 */
@RestController
@RequestMapping("/api")
public class DashboardController {

	private final DashboardService service;

	public DashboardController(DashboardService service) {
		this.service = service;
	}

	@GetMapping("/health")
	public Map<String, Object> health() {
		return Map.of("status", "ok", "time", Instant.now().toString());
	}

	@GetMapping(value = "/markets", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> markets() {
		return json(service.markets());
	}

	@GetMapping(value = "/global", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> global() {
		return json(service.global());
	}

	@GetMapping(value = "/trending", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> trending() {
		return json(service.trending());
	}

	@GetMapping(value = "/exchanges", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> exchanges() {
		return json(service.exchanges());
	}

	@GetMapping(value = "/chart/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> chart(@PathVariable String id,
			@RequestParam(required = false) String period) {
		if (id == null || id.isBlank()) {
			throw new InvalidRequestException("missing_id", "A coin id is required.");
		}
		String resolved = (period == null || period.isBlank()) ? "week" : period;
		if (!TimePeriod.isValid(resolved)) {
			throw new InvalidRequestException("invalid_period",
					"period must be one of: today, week, month, quarter.");
		}
		return json(service.chart(id, resolved));
	}

	private ResponseEntity<String> json(String body) {
		return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
	}
}

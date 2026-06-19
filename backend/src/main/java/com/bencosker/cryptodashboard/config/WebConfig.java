package com.bencosker.cryptodashboard.config;

import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** CORS for the Angular dev origin and the configured CoinGecko {@link RestClient}. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final AppProperties app;

	public WebConfig(AppProperties app) {
		this.app = app;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOrigins(app.allowedOrigin())
				.allowedMethods("GET", "OPTIONS");
	}

	/** RestClient pre-authenticated with the demo API key and sane timeouts. */
	@Bean
	public RestClient coinGeckoRestClient(CoinGeckoProperties props) {
		HttpClient httpClient = HttpClient.newBuilder()
				.connectTimeout(Duration.ofSeconds(10))
				.build();
		JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
		factory.setReadTimeout(Duration.ofSeconds(15));

		return RestClient.builder()
				.baseUrl(props.baseUrl())
				.defaultHeader("Accept", "application/json")
				.defaultHeader("x-cg-demo-api-key", props.apiKey())
				.requestFactory(factory)
				.build();
	}
}

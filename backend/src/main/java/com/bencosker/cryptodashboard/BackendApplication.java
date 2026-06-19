package com.bencosker.cryptodashboard;

import com.bencosker.cryptodashboard.config.DotEnv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BackendApplication {

	public static void main(String[] args) {
		// Load .env (walking up from the working dir) into system properties
		// before Spring resolves ${COINGECKO_API_KEY} etc.
		DotEnv.load();
		SpringApplication.run(BackendApplication.class, args);
	}

}

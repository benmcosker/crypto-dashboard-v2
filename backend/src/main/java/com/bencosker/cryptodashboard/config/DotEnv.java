package com.bencosker.cryptodashboard.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

/**
 * Minimal .env loader. Walks up from the working directory looking for a
 * {@code .env} file and copies any keys not already present in the environment
 * (or system properties) into system properties, so Spring's
 * {@code ${COINGECKO_API_KEY}} placeholders resolve. Dependency-free by design.
 */
public final class DotEnv {

	private DotEnv() {
	}

	public static void load() {
		Path dir = Paths.get("").toAbsolutePath();
		for (int i = 0; i < 5 && dir != null; i++) {
			Path env = dir.resolve(".env");
			if (Files.isRegularFile(env)) {
				parse(env);
				return;
			}
			dir = dir.getParent();
		}
	}

	private static void parse(Path env) {
		try (Stream<String> lines = Files.lines(env)) {
			lines.map(String::trim)
					.filter(line -> !line.isEmpty() && !line.startsWith("#"))
					.forEach(DotEnv::applyLine);
		}
		catch (IOException ignored) {
			// A missing/unreadable .env is non-fatal; real env vars may still be set.
		}
	}

	private static void applyLine(String line) {
		int eq = line.indexOf('=');
		if (eq <= 0) {
			return;
		}
		String key = line.substring(0, eq).trim();
		String value = line.substring(eq + 1).trim().replaceAll("^[\"']|[\"']$", "");
		if (System.getProperty(key) == null && System.getenv(key) == null) {
			System.setProperty(key, value);
		}
	}
}

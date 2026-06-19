package com.bencosker.cryptodashboard.service;

import java.util.Map;

/** Maps the dashboard's time-period filter to a day count for the price chart. */
public final class TimePeriod {

	private static final Map<String, Integer> DAYS = Map.of(
			"today", 1,
			"week", 7,
			"month", 30,
			"quarter", 90);

	private TimePeriod() {
	}

	public static boolean isValid(String period) {
		return DAYS.containsKey(period);
	}

	/** Day count for a period; unknown/empty falls back to 7. */
	public static int days(String period) {
		return DAYS.getOrDefault(period, 7);
	}
}

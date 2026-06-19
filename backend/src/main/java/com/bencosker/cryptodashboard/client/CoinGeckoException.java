package com.bencosker.cryptodashboard.client;

/**
 * Raised when a CoinGecko call fails. Carries the upstream HTTP status (for
 * non-2xx responses) or a transport flag (connection/timeout). The body is kept
 * for server-side logging only — it is never forwarded to clients.
 */
public class CoinGeckoException extends RuntimeException {

	private final int statusCode; // upstream HTTP status; 0 for transport errors
	private final boolean transport;
	private final boolean timeout;
	private final String detail;

	private CoinGeckoException(int statusCode, boolean transport, boolean timeout, String detail) {
		super("CoinGecko error (status=" + statusCode + ", transport=" + transport + ")");
		this.statusCode = statusCode;
		this.transport = transport;
		this.timeout = timeout;
		this.detail = detail;
	}

	/** Non-2xx HTTP response from CoinGecko. */
	public static CoinGeckoException upstream(int statusCode, String path, String body) {
		return new CoinGeckoException(statusCode, false, false, path + " -> " + body);
	}

	/** Connection failure or timeout reaching CoinGecko. */
	public static CoinGeckoException transport(boolean timeout, String message) {
		return new CoinGeckoException(0, true, timeout, message);
	}

	public int statusCode() {
		return statusCode;
	}

	public boolean isTransport() {
		return transport;
	}

	public boolean isTimeout() {
		return timeout;
	}

	public String detail() {
		return detail;
	}
}

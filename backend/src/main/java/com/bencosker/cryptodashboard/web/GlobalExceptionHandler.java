package com.bencosker.cryptodashboard.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.bencosker.cryptodashboard.client.CoinGeckoException;

/**
 * Translates exceptions into the consistent {@link ApiError} JSON shape. Raw
 * upstream detail is logged server-side, never forwarded to clients.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(InvalidRequestException.class)
	public ResponseEntity<ApiError> handleInvalid(InvalidRequestException ex) {
		return error(HttpStatus.BAD_REQUEST, ex.code(), ex.getMessage());
	}

	@ExceptionHandler(CoinGeckoException.class)
	public ResponseEntity<ApiError> handleUpstream(CoinGeckoException ex) {
		if (ex.isTransport()) {
			if (ex.isTimeout()) {
				log.warn("Upstream timeout: {}", ex.detail());
				return error(HttpStatus.GATEWAY_TIMEOUT, "upstream_timeout",
						"The market-data service took too long to respond. Please try again.");
			}
			log.warn("Upstream unreachable: {}", ex.detail());
			return error(HttpStatus.BAD_GATEWAY, "upstream_unreachable",
					"Couldn't reach the market-data service. Please try again shortly.");
		}

		int status = ex.statusCode();
		log.warn("Upstream returned {}: {}", status, ex.detail());
		return switch (status) {
			case 429 -> ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
					.header(HttpHeaders.RETRY_AFTER, "60")
					.body(new ApiError(
							"CoinGecko's rate limit was reached. Please wait a moment and try again.",
							"rate_limited", 429));
			case 401, 403 -> error(HttpStatus.BAD_GATEWAY, "upstream_auth",
					"The market-data service rejected our request. The server's API key may be invalid.");
			case 404 -> error(HttpStatus.NOT_FOUND, "not_found",
					"That resource wasn't found on the market-data service.");
			default -> error(HttpStatus.BAD_GATEWAY, "upstream_error",
					"The market-data service is temporarily unavailable. Please try again shortly.");
		};
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleOther(Exception ex) {
		log.error("Unhandled error", ex);
		return error(HttpStatus.INTERNAL_SERVER_ERROR, "internal_error",
				"Something went wrong on the server. Please try again.");
	}

	private static ResponseEntity<ApiError> error(HttpStatus status, String code, String message) {
		return ResponseEntity.status(status).body(new ApiError(message, code, status.value()));
	}
}

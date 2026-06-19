package com.bencosker.cryptodashboard.web;

/** A bad client request (e.g. unknown period). Maps to HTTP 400. */
public class InvalidRequestException extends RuntimeException {

	private final String code;

	public InvalidRequestException(String code, String message) {
		super(message);
		this.code = code;
	}

	public String code() {
		return code;
	}
}

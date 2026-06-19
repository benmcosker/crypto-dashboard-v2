package com.bencosker.cryptodashboard.web;

/** Consistent JSON error shape: {@code {error, code, status}}. */
public record ApiError(String error, String code, int status) {
}

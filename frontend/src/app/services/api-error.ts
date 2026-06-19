import { HttpErrorResponse } from '@angular/common/http';

/**
 * Normalised API error. status === 0 means the request never reached the
 * server (network failure).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

/** Map Angular's HttpErrorResponse to our typed ApiError, reading the backend's
 *  {error, code, status} shape when present. */
export function toApiError(err: HttpErrorResponse): ApiError {
  if (err.status === 0) {
    return new ApiError(
      "Can't reach the server. Check your connection and that the backend is running.",
      0,
      'network_error',
    );
  }
  const body = err.error as { error?: string; code?: string } | undefined;
  const message = body?.error ?? `Request failed (${err.status}).`;
  const code = body?.code ?? 'http_error';
  return new ApiError(message, err.status, code);
}

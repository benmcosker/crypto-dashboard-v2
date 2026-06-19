import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, toApiError } from './api-error';

describe('toApiError', () => {
  it('maps the backend {error, code, status} body', () => {
    const err = toApiError(
      new HttpErrorResponse({ status: 429, error: { error: 'Slow down', code: 'rate_limited' } }),
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(429);
    expect(err.message).toBe('Slow down');
    expect(err.code).toBe('rate_limited');
    expect(err.isRateLimited).toBeTrue();
    expect(err.isNetwork).toBeFalse();
  });

  it('maps a network failure (status 0)', () => {
    const err = toApiError(new HttpErrorResponse({ status: 0 }));
    expect(err.status).toBe(0);
    expect(err.code).toBe('network_error');
    expect(err.isNetwork).toBeTrue();
  });

  it('falls back to a generic message without a JSON body', () => {
    const err = toApiError(new HttpErrorResponse({ status: 502 }));
    expect(err.status).toBe(502);
    expect(err.message).toContain('502');
  });
});

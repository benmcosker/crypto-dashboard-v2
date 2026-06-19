import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { toApiError } from '../services/api-error';
import { NotificationService } from '../services/notification.service';

/** Maps failed requests to a typed ApiError, raises a single global toast, and
 *  rethrows so each widget can still show its own inline error + retry. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const apiError = toApiError(err);
      notify.error(apiError.message);
      return throwError(() => apiError);
    }),
  );
};

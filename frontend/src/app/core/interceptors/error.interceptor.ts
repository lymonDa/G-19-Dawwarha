import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Error Interceptor — global HTTP error handler.
 * - 401 Unauthorized: clears session and redirects to /login
 * - 403 Forbidden: passes through with a normalized error for component-level handling
 * - 409 Conflict: passes through with normalized error (IDOR/state conflicts)
 * - 500 Internal Error: passes through with normalized error
 *
 * Normalizes backend error envelopes to always expose { message } from
 * both { error: { message } } and { message } response shapes.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Normalize the error message from the backend envelope
      const backendError = error.error;
      let message = 'An unexpected error occurred. Please try again.';

      if (backendError) {
        // Supports both { error: { message } } and { message } envelopes
        message =
          backendError?.error?.message ||
          backendError?.message ||
          message;
      }

      // Handle 401: session expired or invalid token
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }

      // Re-throw a normalized error with the extracted message
      return throwError(() => ({
        ...error,
        error: {
          ...(backendError || {}),
          message
        }
      }));
    })
  );
};

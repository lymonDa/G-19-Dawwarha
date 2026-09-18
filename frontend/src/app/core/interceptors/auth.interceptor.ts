import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Auth Interceptor — attaches JWT Bearer token to every outgoing API request.
 * Only adds Authorization header when a token is present and the request
 * targets /api/* endpoints (guards against sending tokens to external services).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Only add auth header to requests targeting the API
  if (token && req.url.startsWith('/api')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};

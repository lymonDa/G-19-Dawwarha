import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

<<<<<<< HEAD
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
=======
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Skip auth header for register/login requests
  const isPublicAuthRoute = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

  if (token && !isPublicAuthRoute) {
    const clonedReq = req.clone({
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
<<<<<<< HEAD
    return next(authReq);
=======
    return next(clonedReq);
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
  }

  return next(req);
};

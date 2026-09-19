import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;
  try {
    const authService = inject(AuthService, { optional: true });
    token = authService?.getToken() || null;
  } catch {
    // Avoid circular DI during service construction
  }
  if (!token && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('dawwarha_jwt');
  }

  // Skip auth header for register/login requests
  const isPublicAuthRoute = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

  if (token && !isPublicAuthRoute) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
<<<<<<< HEAD

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
=======
import { ToastService } from '../services/toast.service';
import { LanguageService } from '../services/language.service';
import { ApiError } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const languageService = inject(LanguageService, { optional: true });

  const isAr = languageService ? languageService.currentLanguage() === 'ar' : true;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let apiError: ApiError = {
        code: 'INTERNAL_ERROR',
        message: isAr ? 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.',
        status: error.status
      };

      if (error.error && typeof error.error === 'object') {
        const errObj = error.error.error || error.error;
        apiError.code = errObj.code || `HTTP_${error.status}`;
        apiError.message = errObj.message || error.message || apiError.message;
        apiError.fieldErrors = errObj.fieldErrors;
      }

      // Handle specific HTTP Status Codes
      if (error.status === 401) {
        // Unauthenticated: clear session and redirect
        const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
        if (!isAuthRoute) {
          authService.clearSession();
          const currentUrl = router.url;
          router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
          toast.warning(
            isAr ? 'يرجى تسجيل الدخول للمتابعة' : 'Please sign in to continue',
            isAr ? 'تنبيه' : 'Notice'
          );
        }
      } else if (error.status === 403) {
        // Forbidden
        toast.error(
          apiError.message || (isAr ? 'ليس لديك الصلاحية للقيام بهذا الإجراء' : 'You do not have permission for this action'),
          isAr ? 'غير مصرح' : 'Forbidden'
        );
      } else if (error.status === 500) {
        // Internal Server Error
        toast.error(
          isAr ? 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً' : 'Internal server error. Please try again later.',
          isAr ? 'خطأ في الخادم' : 'Server Error'
        );
      } else if (error.status === 0) {
        // Network failure
        apiError.code = 'NETWORK_ERROR';
        apiError.message = isAr
          ? 'انقطع الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.'
          : 'Network error. Please check your internet connection.';
        toast.error(apiError.message, isAr ? 'خطأ في الاتصال' : 'Connection Error');
      }

      return throwError(() => apiError);
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
    })
  );
};

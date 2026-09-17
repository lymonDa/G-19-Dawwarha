import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { ApiError } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let apiError: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.',
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
          toast.warning('يرجى تسجيل الدخول للمتابعة', 'تنبيه');
        }
      } else if (error.status === 403) {
        // Forbidden
        toast.error(apiError.message || 'ليس لديك الصلاحية للقيام بهذا الإجراء', 'غير مصرح');
      } else if (error.status === 500) {
        // Internal Server Error
        toast.error('حدث خطأ في الخادم، يرجى المحاولة لاحقاً', 'خطأ في الخادم');
      } else if (error.status === 0) {
        // Network failure
        apiError.code = 'NETWORK_ERROR';
        apiError.message = 'انقطع الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.';
        toast.error(apiError.message, 'خطأ في الاتصال');
      }

      return throwError(() => apiError);
    })
  );
};

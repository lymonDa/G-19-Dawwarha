import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of, map, catchError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { OrganizationApiService } from '../../features/organizations/organization-api.service';

export const orgVerifiedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const orgApi = inject(OrganizationApiService);

  const user = authService.currentUser();
  if (!user) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Admins always bypass verification checks
  if (user.role === 'admin') {
    return true;
  }

  // Only organization accounts can access org-protected routes
  if (!user.organizationId && (user as any).role !== 'organization') {
    toast.warning('هذا الإجراء مخصص للمنظمات والجمعيات المعتمدة فقط', 'تنبيه التوثيق');
    return router.createUrlTree(['/dashboard']);
  }

  // Organization must have an associated organization ID
  if (!user.organizationId) {
    toast.warning('يتطلب هذا الإجراء تسجيل وتوثيق المنظمة أولاً', 'تنبيه التوثيق');
    return router.createUrlTree(['/organizations/verification']);
  }

  // Check real organization verification status via OrganizationApiService
  return orgApi.getOrganizationById(user.organizationId).pipe(
    map(org => {
      if (org.verificationStatus === 'verified') {
        return true;
      }

      toast.warning('يتطلب هذا الإجراء توثيق واعتماد حساب المنظمة أولاً', 'الحساب قيد المراجعة');
      return router.createUrlTree(['/organizations/verification']);
    }),
    catchError(() => {
      toast.warning('تعذر التحقق من حالة اعتماد المنظمة', 'تنبيه');
      return of(router.createUrlTree(['/organizations/verification']));
    })
  );
};

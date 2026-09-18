import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

export const orgVerifiedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const user = authService.currentUser();
  if (!user) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Admins always bypass verification checks
  if (user.role === 'admin') {
    return true;
  }

  // Check if organization role
  if (user.role === 'organization') {
    const isApproved =
      (user as any).verificationStatus === 'verified' ||
      (user as any).verification?.status === 'approved' ||
      (user as any).isVerified === true;

    if (isApproved) {
      return true;
    }

    toast.warning('يتطلب هذا الإجراء توثيق واعتماد حساب المنظمة أولاً', 'الحساب قيد المراجعة');
    return router.createUrlTree(['/organizations/verification']);
  }

  toast.warning('هذا الإجراء مخصص للمنظمات والجمعيات المعتمدة فقط', 'تنبيه التوثيق');
  return router.createUrlTree(['/dashboard']);
};

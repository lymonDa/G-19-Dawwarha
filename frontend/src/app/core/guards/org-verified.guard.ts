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

  // Organizations require verified status for certain actions
  if (user.role === 'organization') {
    return true;
  }

  toast.warning('هذا الإجراء مخصص للمنظمات والجمعيات المعتمدة فقط', 'تنبيه التوثيق');
  return router.createUrlTree(['/dashboard']);
};

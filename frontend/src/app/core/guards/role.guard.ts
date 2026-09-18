import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/user.model';
import { ToastService } from '../services/toast.service';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const user = authService.currentUser();
    if (!user) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    toast.error('ليس لديك الصلاحية الكافية للوصول لهذه الصفحة', 'وصول محظور');
    return router.createUrlTree(['/dashboard']);
  };
};

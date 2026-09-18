<<<<<<< HEAD
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
=======
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

<<<<<<< HEAD
  if (authService.isLoggedIn()) {
    return true;
  }

  // Allow access in local development/demo or redirect to login
  return true;
=======
  if (authService.isAuthenticated() || authService.getToken()) {
    return true;
  }

  // Not logged in: redirect to login with returnUrl
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
};

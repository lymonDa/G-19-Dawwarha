import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

describe('roleGuard', () => {
  let mockAuthService: any;
  let mockRouter: any;
  let mockToast: any;

  beforeEach(() => {
    mockAuthService = {
      currentUser: vi.fn()
    };
    mockRouter = {
      createUrlTree: vi.fn().mockImplementation((commands, extras) => ({ commands, extras } as any))
    };
    mockToast = {
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToast }
      ]
    });
  });

  it('should redirect to login if no user is logged in', () => {
    mockAuthService.currentUser.mockReturnValue(null);
    const guard = roleGuard(['admin']);
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url: '/admin/users' } as RouterStateSnapshot)
    );
    expect(result).not.toBe(true);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin/users' } });
  });

  it('should allow navigation if user has allowed role', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u1', role: 'admin' });
    const guard = roleGuard(['admin']);
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url: '/admin/users' } as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('should block navigation and display error toast if user does not have allowed role', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u1', role: 'user' });
    const guard = roleGuard(['admin']);
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url: '/admin/users' } as RouterStateSnapshot)
    );
    expect(result).not.toBe(true);
    expect(mockToast.error).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });
});

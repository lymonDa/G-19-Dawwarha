import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { orgVerifiedGuard } from './org-verified.guard';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

describe('orgVerifiedGuard', () => {
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
      warning: vi.fn()
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
    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );
    expect(result).not.toBe(true);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/organizations/dashboard' } });
  });

  it('should always allow admin users without verification check', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u1', role: 'admin' });
    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('should allow verified organization', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u2', role: 'organization', verificationStatus: 'verified' });
    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('should redirect unverified or pending organization to verification page with warning', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u2', role: 'organization', verificationStatus: 'pending' });
    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );
    expect(result).not.toBe(true);
    expect(mockToast.warning).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/organizations/verification']);
  });
});

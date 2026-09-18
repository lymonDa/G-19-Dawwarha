import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { orgVerifiedGuard } from './org-verified.guard';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { OrganizationApiService } from '../../features/organizations/organization-api.service';
import { of, throwError, isObservable } from 'rxjs';

describe('orgVerifiedGuard', () => {
  let mockAuthService: any;
  let mockRouter: any;
  let mockToast: any;
  let mockOrgApi: any;

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
    mockOrgApi = {
      getOrganizationById: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToast },
        { provide: OrganizationApiService, useValue: mockOrgApi }
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
    expect(mockOrgApi.getOrganizationById).not.toHaveBeenCalled();
  });

  it('should redirect non-organization users to dashboard', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u2', role: 'user' });
    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );
    expect(result).not.toBe(true);
    expect(mockToast.warning).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should redirect organization without organizationId to verification page', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u3', role: 'organization' });
    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );
    expect(result).not.toBe(true);
    expect(mockToast.warning).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/organizations/verification']);
  });

  it('should allow verified organization when backend returns verified status', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u4', role: 'organization', organizationId: 'org-1' });
    mockOrgApi.getOrganizationById.mockReturnValue(of({ id: 'org-1', verificationStatus: 'verified' }));

    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );

    expect(isObservable(result)).toBe(true);
    (result as any).subscribe((val: any) => {
      expect(val).toBe(true);
    });
    expect(mockOrgApi.getOrganizationById).toHaveBeenCalledWith('org-1');
  });

  it('should redirect unverified or pending organization to verification page with warning', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u4', role: 'organization', organizationId: 'org-1' });
    mockOrgApi.getOrganizationById.mockReturnValue(of({ id: 'org-1', verificationStatus: 'pending' }));

    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );

    expect(isObservable(result)).toBe(true);
    (result as any).subscribe((val: any) => {
      expect(val).not.toBe(true);
      expect(mockToast.warning).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/organizations/verification']);
    });
  });

  it('should handle API error gracefully and redirect to verification page', () => {
    mockAuthService.currentUser.mockReturnValue({ id: 'u4', role: 'organization', organizationId: 'org-1' });
    mockOrgApi.getOrganizationById.mockReturnValue(throwError(() => ({ message: 'Server down' })));

    const result = TestBed.runInInjectionContext(() =>
      orgVerifiedGuard({} as ActivatedRouteSnapshot, { url: '/organizations/dashboard' } as RouterStateSnapshot)
    );

    expect(isObservable(result)).toBe(true);
    (result as any).subscribe((val: any) => {
      expect(val).not.toBe(true);
      expect(mockToast.warning).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/organizations/verification']);
    });
  });
});

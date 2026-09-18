import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { throwError } from 'rxjs';

describe('errorInterceptor', () => {
  let mockAuthService: any;
  let mockRouter: any;
  let mockToast: any;

  beforeEach(() => {
    mockAuthService = {
      clearSession: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn(),
      url: '/profile'
    };
    mockToast = {
      warning: vi.fn(),
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

  it('should handle 401 by clearing session and redirecting to login', () => {
    const req = new HttpRequest('GET', '/api/users/me');
    const errorResponse = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const next: HttpHandlerFn = () => throwError(() => errorResponse);

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: (err) => {
          expect(mockAuthService.clearSession).toHaveBeenCalled();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/profile' } });
          expect(mockToast.warning).toHaveBeenCalled();
        }
      });
    });
  });

  it('should not redirect on 401 if request is login endpoint', () => {
    const req = new HttpRequest('POST', '/api/auth/login', {});
    const errorResponse = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const next: HttpHandlerFn = () => throwError(() => errorResponse);

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(mockAuthService.clearSession).not.toHaveBeenCalled();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
        }
      });
    });
  });

  it('should display error toast on 403 forbidden and 500 server error', () => {
    const req403 = new HttpRequest('GET', '/api/admin/metrics');
    const err403 = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    const next403: HttpHandlerFn = () => throwError(() => err403);

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req403, next403).subscribe({
        error: () => {
          expect(mockToast.error).toHaveBeenCalled();
        }
      });
    });

    const req500 = new HttpRequest('GET', '/api/resources');
    const err500 = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    const next500: HttpHandlerFn = () => throwError(() => err500);

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req500, next500).subscribe({
        error: () => {
          expect(mockToast.error).toHaveBeenCalled();
        }
      });
    });
  });
});

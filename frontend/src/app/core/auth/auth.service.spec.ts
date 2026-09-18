import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiBaseService } from '../services/api-base.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockApi: any;
  let mockRouter: any;
  let mockToast: any;

  beforeEach(() => {
    localStorage.clear();
    mockApi = {
      get: vi.fn().mockReturnValue(of({ success: true, data: { id: 'u1', name: 'User 1', email: 'u1@test.com', role: 'user', status: 'active' } })),
      post: vi.fn(),
      put: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn()
    };
    mockToast = {
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiBaseService, useValue: mockApi },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should initialize with not authenticated if localStorage is empty', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.authSession()).toBeNull();
  });

  it('should update session and signals upon successful login', () => {
    const mockAuthResponse = {
      success: true,
      data: {
        token: 'fake-jwt-token',
        user: { id: 'u1', name: 'Ahmed', email: 'ahmed@test.com', role: 'admin', status: 'active', createdAt: '2026-01-01' }
      }
    };
    mockApi.post.mockReturnValue(of(mockAuthResponse));

    service.login({ email: 'ahmed@test.com', password: 'password123' }).subscribe(res => {
      expect(res.data.token).toBe('fake-jwt-token');
    });

    expect(service.token()).toBe('fake-jwt-token');
    expect(service.currentUser()?.name).toBe('Ahmed');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(service.authSession()?.token).toBe('fake-jwt-token');
  });

  it('should clear session and redirect on logout', () => {
    mockApi.post.mockReturnValue(of({ success: true }));
    (service as any).setSession('fake-token', { id: 'u1', name: 'Test', email: 't@t.com', role: 'user', status: 'active', createdAt: '' });

    expect(service.isAuthenticated()).toBe(true);
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});

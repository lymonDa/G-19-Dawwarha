import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { ApiBaseService } from '../services/api-base.service';
import { User, UserRole } from '../models/user.model';
import { AuthSession, AuthResponse } from './auth-session.model';
import { ToastService } from '../services/toast.service';

export interface UpdateProfilePayload {
  name?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  location?: {
    city: string;
    area?: string;
  };
  address?: {
    street?: string;
    city?: string;
    area?: string;
    country?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiBaseService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private readonly TOKEN_KEY = 'dawwarha_jwt';
  private readonly USER_KEY = 'dawwarha_user';

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.currentUserSignal());
  readonly userRole = computed<UserRole | null>(() => this.currentUserSignal()?.role ?? null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  readonly isOrganization = computed(() => !!this.currentUserSignal()?.organizationId);
  readonly authSession = computed<AuthSession | null>(() => {
    const user = this.currentUserSignal();
    const token = this.tokenSignal();
    if (!user || !token) return null;
    return { user, token };
  });

  constructor() {
    this.restoreLocalState();
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        this.restoreSession();
      });
    }
  }

  private normalizeUser(data: any): User {
    if (!data) return data;
    const phone = data.contactInfo?.phone || data.phone;
    return {
      ...data,
      id: data._id || data.id,
      phone,
      contactInfo: {
        ...data.contactInfo,
        phone
      }
    };
  }

  private restoreLocalState(): void {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    if (token) {
      this.tokenSignal.set(token);
    }
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUserSignal.set(this.normalizeUser(user));
      } catch {
        // Invalid stored json
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(res => {
        if (res && res.data) {
          this.setSession(res.data.token, res.data.user);
        }
      })
    );
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    role?: UserRole | string;
    phone?: string;
  }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', payload).pipe(
      tap(res => {
        if (res && res.data) {
          this.setSession(res.data.token, res.data.user);
        }
      })
    );
  }

  logout(): void {
    // Best-effort backend call
    this.api.post('/auth/logout', {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this.clearSession();
    this.router.navigate(['/']);
    this.toast.info('تم تسجيل الخروج بنجاح', 'وداعاً');
  }

  restoreSession(): void {
    const token = this.tokenSignal();
    if (!token) return;

    this.api.get<{ success: boolean; data: any }>('/users/me').pipe(
      tap(res => {
        if (res && res.data) {
          const user = this.normalizeUser(res.data);
          this.currentUserSignal.set(user);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }
        }
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    ).subscribe();
  }

  updateProfile(data: UpdateProfilePayload): Observable<{ success: boolean; data: User }> {
    return this.api.put<{ success: boolean; data: any }>('/users/me', data).pipe(
      map(res => ({
        success: res.success,
        data: this.normalizeUser(res.data)
      })),
      tap(res => {
        if (res && res.data) {
          this.currentUserSignal.set(res.data);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
          }
          this.toast.success('تم تحديث الملف الشخصي بنجاح');
        }
      })
    );
  }

  private setSession(token: string, user: User): void {
    const normalized = this.normalizeUser(user);
    this.tokenSignal.set(token);
    this.currentUserSignal.set(normalized);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(normalized));
    }
  }

  clearSession(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}

<<<<<<< HEAD
import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';
=======
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiBaseService } from '../services/api-base.service';
import { User, UserRole } from '../models/user.model';
import { AuthSession, AuthResponse } from './auth-session.model';
import { ToastService } from '../services/toast.service';
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

@Injectable({
  providedIn: 'root'
})
export class AuthService {
<<<<<<< HEAD
  private readonly TOKEN_KEY = 'dawwarha_token';
  private readonly USER_KEY = 'dawwarha_user';

  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore in SSR/non-browser contexts
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken() || !!this.currentUser();
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setSession(user: User, token: string): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {
      // Ignore
    }
    this.currentUser.set(user);
  }

  logout(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    } catch {
      // Ignore
    }
    this.currentUser.set(null);
=======
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
  readonly isOrganization = computed(() => this.currentUserSignal()?.role === 'organization');
  readonly authSession = computed<AuthSession | null>(() => {
    const user = this.currentUserSignal();
    const token = this.tokenSignal();
    if (!user || !token) return null;
    return { user, token };
  });

  constructor() {
    this.restoreLocalState();
    this.restoreSession();
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
        this.currentUserSignal.set(user);
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
    role?: UserRole;
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

    this.api.get<{ success: boolean; data: User }>('/users/me').pipe(
      tap(res => {
        if (res && res.data) {
          this.currentUserSignal.set(res.data);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
          }
        }
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    ).subscribe();
  }

  updateProfile(data: Partial<User>): Observable<{ success: boolean; data: User }> {
    return this.api.put<{ success: boolean; data: User }>('/users/me', data).pipe(
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
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
  }
}

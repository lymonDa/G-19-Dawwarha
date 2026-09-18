import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
  }
}

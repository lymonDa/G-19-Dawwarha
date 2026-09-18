import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div class="w-full max-w-md rounded-card border border-neutral-200 bg-neutral-0 p-8 shadow-sm">
        <h1 class="text-2xl font-bold text-neutral-900">Dawwarha — Login</h1>
        <p class="mt-2 text-sm text-neutral-500">Sign in to manage your requests and matches.</p>
        <div class="mt-6 space-y-4">
          <button
            (click)="loginDemo()"
            class="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white transition hover:bg-primary-500"
          >
            Sign in as Demo Requester
          </button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loginDemo(): void {
    this.auth.setSession({
      _id: '65f1a2b3c4d5e6f7a8b9c0d1',
      id: '65f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Demo Requester',
      email: 'requester@example.com',
      role: 'individual',
      isVerified: true
    }, 'demo_token_123');
    this.router.navigate(['/requests']);
  }
}

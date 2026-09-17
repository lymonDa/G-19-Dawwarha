import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-neutral-100 text-neutral-900">
      <!-- Admin Top Operational Header -->
      <header class="bg-neutral-900 text-white h-14 px-4 sm:px-6 flex items-center justify-between border-b border-neutral-800 z-30 shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></span>
            <span class="font-bold text-sm tracking-wide">Dawwarha · Operations Console</span>
          </div>
          <span class="text-xs bg-neutral-800 text-primary-100 px-2 py-0.5 rounded border border-neutral-700">
            Admin Console v1.0
          </span>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="languageService.toggleLanguage()"
            class="px-2 py-1 rounded text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {{ languageService.t().LANG_TOGGLE }}
          </button>

          <!-- Return to Normal View -->
          <a routerLink="/dashboard">
            <app-button variant="secondary" size="sm">
              Back to App
            </app-button>
          </a>

          <button
            type="button"
            (click)="authService.logout()"
            class="text-xs text-danger-bg hover:text-danger px-2 py-1"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden">
        <!-- Admin Sidebar -->
        <aside class="w-60 bg-white border-e border-neutral-200 flex flex-col z-20 shrink-0">
          <div class="p-3 border-b border-neutral-100">
            <p class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Control & Monitoring</p>
          </div>

          <nav class="flex-1 p-2 space-y-1 overflow-y-auto text-xs font-medium">
            <a
              routerLink="/admin"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard & Analytics</span>
            </a>

            <a
              routerLink="/admin/users"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Users & Accounts</span>
            </a>

            <a
              routerLink="/admin/organizations"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Organizations & Verification</span>
            </a>

            <a
              routerLink="/admin/resources"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Listed Resources</span>
            </a>

            <a
              routerLink="/admin/requests"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Demand Requests</span>
            </a>

            <a
              routerLink="/admin/reports"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Reports & Moderation</span>
            </a>

            <a
              routerLink="/admin/categories"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Manage Categories</span>
            </a>
          </nav>
        </aside>

        <!-- Admin Content Main Region -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
}

import { Component, inject, signal } from '@angular/core';
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
    <div class="min-h-screen flex flex-col bg-neutral-100 text-neutral-900" [dir]="languageService.direction()">
      <!-- Admin Top Operational Header -->
      <header class="bg-neutral-900 text-white h-14 px-4 sm:px-6 flex items-center justify-between border-b border-neutral-800 z-30 shrink-0">
        <div class="flex items-center gap-3">
          <!-- Mobile Sidebar Toggle -->
          <button
            type="button"
            (click)="isMobileSidebarOpen.set(!isMobileSidebarOpen())"
            class="md:hidden p-1.5 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            [attr.aria-label]="languageService.t().ADMIN_MOBILE_NAV_TITLE"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></span>
            <span class="font-bold text-sm tracking-wide">{{ languageService.t().ADMIN_TITLE }}</span>
          </div>
          <span class="hidden sm:inline text-xs bg-neutral-800 text-primary-100 px-2 py-0.5 rounded border border-neutral-700">
            {{ languageService.t().ADMIN_CONSOLE_VERSION }}
          </span>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            (click)="languageService.toggleLanguage()"
            class="px-2 py-1 rounded text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {{ languageService.t().LANG_TOGGLE }}
          </button>

          <!-- Return to Normal View -->
          <a routerLink="/dashboard">
            <app-button variant="secondary" size="sm">
              {{ languageService.t().ADMIN_BACK_TO_APP }}
            </app-button>
          </a>

          <button
            type="button"
            (click)="authService.logout()"
            class="text-xs text-danger-bg hover:text-danger px-2 py-1 cursor-pointer"
          >
            {{ languageService.t().ADMIN_SIGN_OUT }}
          </button>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden relative">
        <!-- Desktop Sidebar -->
        <aside class="hidden md:flex flex-col w-60 bg-white border-e border-neutral-200 z-20 shrink-0">
          <div class="p-3 border-b border-neutral-100">
            <p class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {{ languageService.t().ADMIN_CONTROL_MONITORING }}
            </p>
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
              <span>{{ languageService.t().ADMIN_NAV_DASHBOARD }}</span>
            </a>

            <a
              routerLink="/admin/users"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{{ languageService.t().ADMIN_NAV_USERS }}</span>
            </a>

            <a
              routerLink="/admin/organizations"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{{ languageService.t().ADMIN_NAV_ORGANIZATIONS }}</span>
            </a>

            <a
              routerLink="/admin/resources"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>{{ languageService.t().ADMIN_NAV_RESOURCES }}</span>
            </a>

            <a
              routerLink="/admin/requests"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{{ languageService.t().ADMIN_NAV_REQUESTS }}</span>
            </a>

            <a
              routerLink="/admin/reports"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ languageService.t().ADMIN_NAV_REPORTS }}</span>
            </a>

            <a
              routerLink="/admin/categories"
              routerLinkActive="bg-primary-50 text-primary font-bold"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{{ languageService.t().ADMIN_NAV_CATEGORIES }}</span>
            </a>
          </nav>
        </aside>

        <!-- Mobile Drawer Sidebar (< 768px) -->
        @if (isMobileSidebarOpen()) {
          <div class="fixed inset-0 z-50 md:hidden flex">
            <!-- Backdrop -->
            <div
              class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
              (click)="isMobileSidebarOpen.set(false)"
            ></div>

            <!-- Drawer Container -->
            <aside class="relative w-64 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl z-10">
              <div class="h-14 flex items-center justify-between px-4 border-b border-neutral-100 bg-neutral-50">
                <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {{ languageService.t().ADMIN_MOBILE_NAV_TITLE }}
                </span>
                <button
                  type="button"
                  (click)="isMobileSidebarOpen.set(false)"
                  class="p-1 rounded text-neutral-400 hover:text-neutral-700"
                  aria-label="Close menu"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav class="flex-1 p-3 space-y-1 overflow-y-auto text-xs font-medium" (click)="isMobileSidebarOpen.set(false)">
                <a
                  routerLink="/admin"
                  routerLinkActive="bg-primary-50 text-primary font-bold"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  {{ languageService.t().ADMIN_NAV_DASHBOARD }}
                </a>
                <a
                  routerLink="/admin/users"
                  routerLinkActive="bg-primary-50 text-primary font-bold"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  {{ languageService.t().ADMIN_NAV_USERS }}
                </a>
                <a
                  routerLink="/admin/organizations"
                  routerLinkActive="bg-primary-50 text-primary font-bold"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  {{ languageService.t().ADMIN_NAV_ORGANIZATIONS }}
                </a>
                <a
                  routerLink="/admin/resources"
                  routerLinkActive="bg-primary-50 text-primary font-bold"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  {{ languageService.t().ADMIN_NAV_RESOURCES }}
                </a>
                <a
                  routerLink="/admin/requests"
                  routerLinkActive="bg-primary-50 text-primary font-bold"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  {{ languageService.t().ADMIN_NAV_REQUESTS }}
                </a>
                <a
                  routerLink="/admin/reports"
                  routerLinkActive="bg-primary-50 text-primary font-bold"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  {{ languageService.t().ADMIN_NAV_REPORTS }}
                </a>
                <a
                  routerLink="/admin/categories"
                  routerLinkActive="bg-primary-50 text-primary font-bold"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  {{ languageService.t().ADMIN_NAV_CATEGORIES }}
                </a>
              </nav>
            </aside>
          </div>
        }

        <!-- Admin Content Main Region -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  isMobileSidebarOpen = signal(false);
}

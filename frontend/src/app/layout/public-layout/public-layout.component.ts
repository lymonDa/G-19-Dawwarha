import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-surface text-neutral-900">
      <!-- Top Navigation -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-6">
            <a routerLink="/" class="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <!-- Official Dawwarha Logo -->
              <div class="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center p-1 border border-primary-100 overflow-hidden">
                <img src="/assets/logo/logo-mark.png" alt="Dawwarha" class="w-full h-full object-contain" />
              </div>
              <div class="flex flex-col">
                <span class="text-base font-bold text-neutral-900 tracking-tight leading-tight">{{ languageService.t().BRAND_NAME }}</span>
                <span class="text-xs text-primary font-semibold leading-none">{{ languageService.t().BRAND_NAME_AR }}</span>
              </div>
            </a>

            <!-- Desktop Nav Links -->
            <nav class="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-700">
              <a routerLink="/resources" routerLinkActive="text-primary font-semibold" class="hover:text-primary transition-colors">
                {{ languageService.t().NAV_RESOURCES }}
              </a>
              <a routerLink="/requests" routerLinkActive="text-primary font-semibold" class="hover:text-primary transition-colors">
                {{ languageService.t().NAV_REQUESTS }}
              </a>
              <a routerLink="/how-it-works" routerLinkActive="text-primary font-semibold" class="hover:text-primary transition-colors">
                {{ languageService.t().NAV_HOW_IT_WORKS }}
              </a>
              <a routerLink="/about" routerLinkActive="text-primary font-semibold" class="hover:text-primary transition-colors">
                {{ languageService.t().NAV_ABOUT }}
              </a>
            </nav>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <!-- Language Toggle Button -->
            <button
              type="button"
              (click)="languageService.toggleLanguage()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              title="تغيير اللغة / Change Language"
            >
              <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span class="font-semibold">{{ languageService.t().LANG_TOGGLE }}</span>
            </button>

            @if (authService.isAuthenticated()) {
              <a routerLink="/dashboard">
                <app-button variant="primary" size="sm">
                  {{ languageService.t().NAV_DASHBOARD }}
                </app-button>
              </a>
            } @else {
              <div class="flex items-center gap-1.5 sm:gap-2">
                <a routerLink="/login">
                  <app-button variant="ghost" size="sm">
                    {{ languageService.t().NAV_LOGIN }}
                  </app-button>
                </a>
                <a routerLink="/register">
                  <app-button variant="primary" size="sm">
                    {{ languageService.t().NAV_REGISTER }}
                  </app-button>
                </a>
              </div>
            }

            <!-- Mobile Hamburger Button -->
            <button
              type="button"
              (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
              class="md:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-100"
              aria-label="Menu"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Dropdown Menu -->
        @if (isMobileMenuOpen()) {
          <div class="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 flex flex-col gap-3">
            <a routerLink="/resources" (click)="isMobileMenuOpen.set(false)" class="text-sm font-medium text-neutral-800 py-1.5">
              {{ languageService.t().NAV_RESOURCES }}
            </a>
            <a routerLink="/requests" (click)="isMobileMenuOpen.set(false)" class="text-sm font-medium text-neutral-800 py-1.5">
              {{ languageService.t().NAV_REQUESTS }}
            </a>
            <a routerLink="/how-it-works" (click)="isMobileMenuOpen.set(false)" class="text-sm font-medium text-neutral-800 py-1.5">
              {{ languageService.t().NAV_HOW_IT_WORKS }}
            </a>
            <a routerLink="/about" (click)="isMobileMenuOpen.set(false)" class="text-sm font-medium text-neutral-800 py-1.5">
              {{ languageService.t().NAV_ABOUT }}
            </a>

            @if (!authService.isAuthenticated()) {
              <div class="flex items-center gap-2 pt-3 border-t border-neutral-100">
                <a routerLink="/login" (click)="isMobileMenuOpen.set(false)" class="w-1/2">
                  <app-button variant="secondary" size="sm" [fullWidth]="true">{{ languageService.t().NAV_LOGIN }}</app-button>
                </a>
                <a routerLink="/register" (click)="isMobileMenuOpen.set(false)" class="w-1/2">
                  <app-button variant="primary" size="sm" [fullWidth]="true">{{ languageService.t().NAV_REGISTER }}</app-button>
                </a>
              </div>
            }
          </div>
        }
      </header>

      <!-- Main Content Slot -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Civic Footer -->
      <footer class="bg-neutral-900 text-neutral-300 pt-12 pb-8 border-t border-neutral-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div class="md:col-span-2 flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-white">{{ languageService.t().BRAND_NAME }} · {{ languageService.t().BRAND_NAME_AR }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-primary-900 text-primary-100 border border-primary-700">Civic Infrastructure</span>
              </div>
              <p class="text-sm text-neutral-400 max-w-md leading-relaxed">
                {{ languageService.t().FOOTER_DESC }}
              </p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-white mb-3">{{ languageService.t().FOOTER_LINKS_HEADER }}</h4>
              <ul class="space-y-2 text-xs text-neutral-400">
                <li><a routerLink="/resources" class="hover:text-white transition-colors">{{ languageService.t().NAV_RESOURCES }}</a></li>
                <li><a routerLink="/requests" class="hover:text-white transition-colors">{{ languageService.t().NAV_REQUESTS }}</a></li>
                <li><a routerLink="/how-it-works" class="hover:text-white transition-colors">{{ languageService.t().NAV_HOW_IT_WORKS }}</a></li>
                <li><a routerLink="/about" class="hover:text-white transition-colors">{{ languageService.t().NAV_ABOUT }}</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-white mb-3">{{ languageService.t().FOOTER_ORGS_HEADER }}</h4>
              <ul class="space-y-2 text-xs text-neutral-400">
                <li><a routerLink="/organizations/register" class="hover:text-white transition-colors">Register an Organization</a></li>
                <li><a routerLink="/login" class="hover:text-white transition-colors">{{ languageService.t().NAV_LOGIN }}</a></li>
                <li><a routerLink="/about" class="hover:text-white transition-colors">{{ languageService.t().NAV_ABOUT }}</a></li>
              </ul>
            </div>
          </div>

          <div class="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
            <p>{{ languageService.t().FOOTER_COPYRIGHT }}</p>
            <p>NTI Civic Resource Coordination Platform</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  isMobileMenuOpen = signal(false);
}

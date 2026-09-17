import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="flex flex-col w-full">
      <!-- HERO SECTION -->
      <section class="relative w-full overflow-hidden pt-12 pb-20 bg-gradient-to-b from-primary-50/50 to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Civic Pill Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-primary-100 shadow-sm mb-6">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span class="text-xs font-semibold text-primary-800">{{ languageService.t().HERO_PILL }}</span>
          </div>

          <!-- Hero Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div class="lg:col-span-8 flex flex-col gap-4">
              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                {{ languageService.t().HERO_TITLE_1 }} <br class="hidden sm:inline" />
                <span class="text-primary">{{ languageService.t().HERO_TITLE_HIGHLIGHT }}</span>
                {{ languageService.t().HERO_TITLE_2 }}
              </h1>
              
              <p class="text-lg text-neutral-700 leading-relaxed max-w-2xl mt-2">
                {{ languageService.t().HERO_SUBTITLE }}
              </p>

              <!-- CTA Buttons -->
              <div class="flex flex-wrap items-center gap-4 pt-4">
                <a routerLink="/resources">
                  <app-button variant="primary" size="lg">
                    <div class="flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>{{ languageService.t().HERO_CTA_BROWSE }}</span>
                    </div>
                  </app-button>
                </a>

                @if (!authService.isAuthenticated()) {
                  <a routerLink="/register">
                    <app-button variant="secondary" size="lg">
                      <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{{ languageService.t().HERO_CTA_OFFER }}</span>
                      </div>
                    </app-button>
                  </a>
                } @else {
                  <a routerLink="/dashboard">
                    <app-button variant="secondary" size="lg">
                      <span>{{ languageService.t().NAV_DASHBOARD }}</span>
                    </app-button>
                  </a>
                }

                <div class="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium">
                  <span class="w-2 h-2 rounded-full bg-primary"></span>
                  <span>{{ languageService.t().HERO_STAT_TRANSFERS }}</span>
                </div>
              </div>
            </div>

            <!-- Stats Highlight Card -->
            <div class="lg:col-span-4 bg-white p-6 rounded-card border border-neutral-200 shadow-sm flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{{ languageService.t().HERO_REDISTRIBUTION_RATE }}</span>
                <span class="px-2.5 py-0.5 rounded-full bg-success-bg text-success text-xs font-bold">{{ languageService.t().HERO_FULFILLED }}</span>
              </div>

              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold text-neutral-900">{{ languageService.t().HERO_UNITS_COUNT }}</span>
                <span class="text-sm font-medium text-neutral-600">{{ languageService.t().HERO_UNITS_LABEL }}</span>
              </div>

              <p class="text-xs text-neutral-600 leading-relaxed">
                {{ languageService.t().HERO_UNITS_DESC }}
              </p>

              <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>{{ languageService.t().HERO_ACTIVE_AREAS }}</span>
              </div>
            </div>
          </div>

          <!-- THE 4-STEP CIRCULATION LOOP -->
          <div class="bg-white rounded-card border border-neutral-200 p-8 shadow-sm">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider">{{ languageService.t().LOOP_SUBTITLE }}</span>
                <h2 class="text-2xl font-bold text-neutral-900 mt-1">{{ languageService.t().LOOP_TITLE }}</h2>
              </div>
              <span class="text-xs bg-primary-50 text-primary-800 font-semibold px-3 py-1.5 rounded-md border border-primary-100 font-mono">
                Deterministic Handshake Protocol v2.4
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Step 1 -->
              <div class="p-5 rounded-lg bg-neutral-50 border border-neutral-200 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-primary">STEP 01</span>
                  <div class="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <h3 class="font-semibold text-neutral-900 text-base">{{ languageService.t().LOOP_STEP1_TITLE }}</h3>
                <p class="text-xs text-neutral-600 leading-relaxed">
                  {{ languageService.t().LOOP_STEP1_DESC }}
                </p>
              </div>

              <!-- Step 2 -->
              <div class="p-5 rounded-lg bg-neutral-50 border border-neutral-200 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-primary">STEP 02</span>
                  <div class="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h3 class="font-semibold text-neutral-900 text-base">{{ languageService.t().LOOP_STEP2_TITLE }}</h3>
                <p class="text-xs text-neutral-600 leading-relaxed">
                  {{ languageService.t().LOOP_STEP2_DESC }}
                </p>
              </div>

              <!-- Step 3 -->
              <div class="p-5 rounded-lg bg-neutral-50 border border-neutral-200 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-primary">STEP 03</span>
                  <div class="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 class="font-semibold text-neutral-900 text-base">{{ languageService.t().LOOP_STEP3_TITLE }}</h3>
                <p class="text-xs text-neutral-600 leading-relaxed">
                  {{ languageService.t().LOOP_STEP3_DESC }}
                </p>
              </div>

              <!-- Step 4 -->
              <div class="p-5 rounded-lg bg-sand-50 border border-sand-200 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-sand-700">STEP 04</span>
                  <div class="w-8 h-8 rounded-full bg-sand-500 text-white flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 class="font-semibold text-neutral-900 text-base">{{ languageService.t().LOOP_STEP4_TITLE }}</h3>
                <p class="text-xs text-neutral-600 leading-relaxed">
                  {{ languageService.t().LOOP_STEP4_DESC }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class LandingComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
}

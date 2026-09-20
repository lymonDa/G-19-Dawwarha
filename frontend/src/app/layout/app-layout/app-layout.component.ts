import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex bg-neutral-50 text-neutral-900" [dir]="languageService.direction()">
      <!-- Desktop Sidebar -->
      <aside
        class="hidden md:flex flex-col border-e border-neutral-200 bg-white transition-all duration-300 z-30 shrink-0"
        [class.w-64]="!isCollapsed()"
        [class.w-20]="isCollapsed()"
      >
        <!-- Sidebar Brand Header -->
        <div class="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
          <a routerLink="/dashboard" class="flex items-center gap-3 overflow-hidden">
            <div class="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100 overflow-hidden">
              <img src="/assets/logo/logo-mark.png" alt="Dawwarha" class="w-full h-full object-contain p-0.5" />
            </div>
            @if (!isCollapsed()) {
              <div class="flex flex-col whitespace-nowrap">
                <span class="text-sm font-bold text-neutral-900">{{ languageService.t().BRAND_NAME }}</span>
                <span class="text-xs text-primary font-semibold leading-none">{{ languageService.t().BRAND_NAME_AR }}</span>
              </div>
            }
          </a>

          <button
            type="button"
            (click)="isCollapsed.set(!isCollapsed())"
            class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-transform duration-200"
            [class.rotate-180]="languageService.isRtl() ? !isCollapsed() : isCollapsed()"
            [attr.aria-label]="isCollapsed() ? (languageService.isRtl() ? 'توسيع الشريط الجانبي' : 'Expand sidebar') : (languageService.isRtl() ? 'طي الشريط الجانبي' : 'Collapse sidebar')"
            [title]="isCollapsed() ? (languageService.isRtl() ? 'توسيع الشريط الجانبي' : 'Expand sidebar') : (languageService.isRtl() ? 'طي الشريط الجانبي' : 'Collapse sidebar')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary-50 text-primary font-semibold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            @if (!isCollapsed()) { <span>{{ languageService.t().NAV_DASHBOARD }}</span> }
          </a>

          <a
            routerLink="/resources"
            routerLinkActive="bg-primary-50 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            @if (!isCollapsed()) { <span>{{ languageService.t().NAV_RESOURCES }}</span> }
          </a>

          <a
            routerLink="/resources/mine"
            routerLinkActive="bg-primary-50 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            @if (!isCollapsed()) { <span>{{ languageService.t().NAV_MY_RESOURCES }}</span> }
          </a>

          <a
            routerLink="/requests"
            routerLinkActive="bg-primary-50 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            @if (!isCollapsed()) { <span>{{ languageService.t().NAV_REQUESTS }}</span> }
          </a>

          <a
            routerLink="/requests/mine"
            routerLinkActive="bg-primary-50 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            @if (!isCollapsed()) { <span>{{ languageService.t().NAV_MY_REQUESTS }}</span> }
          </a>

          <a
            routerLink="/matches"
            routerLinkActive="bg-primary-50 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            @if (!isCollapsed()) { <span>{{ languageService.t().NAV_MATCHES }}</span> }
          </a>

          <a
            routerLink="/contributions"
            routerLinkActive="bg-sand-50 text-sand-700 font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-sand-50 hover:text-sand-700 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0 text-sand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            @if (!isCollapsed()) { <span>{{ languageService.t().NAV_CONTRIBUTIONS }}</span> }
          </a>

          @if (authService.isOrganization()) {
            <div class="pt-3 mt-2 border-t border-neutral-200">
              <a
                routerLink="/organizations/dashboard"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                @if (!isCollapsed()) { <span>{{ languageService.t().NAV_ORG_DASHBOARD }}</span> }
              </a>
            </div>
          }

          @if (authService.isAdmin()) {
            <div class="pt-3 mt-2 border-t border-neutral-200">
              <a
                routerLink="/admin"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                <svg class="w-5 h-5 shrink-0 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                @if (!isCollapsed()) { <span>{{ languageService.t().NAV_ADMIN }}</span> }
              </a>
            </div>
          }
        </nav>

        <!-- Sidebar User Footer -->
        <div class="p-3 border-t border-neutral-200">
          <div class="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center text-xs shrink-0">
              {{ authService.currentUser()?.name?.charAt(0) || 'U' }}
            </div>
            @if (!isCollapsed()) {
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-neutral-900 truncate">{{ authService.currentUser()?.name }}</p>
                <p class="text-[11px] text-neutral-500 truncate">{{ authService.currentUser()?.email }}</p>
              </div>
            }
          </div>
        </div>
      </aside>

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <!-- Sticky Header Bar -->
        <header class="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6">
          <div class="flex items-center gap-3">
            <!-- Mobile Drawer Hamburger Toggle (< md) -->
            <button
              type="button"
              (click)="isMobileDrawerOpen.set(true)"
              class="md:hidden p-1.5 -ms-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              [attr.aria-label]="languageService.isRtl() ? 'فتح قائمة التنقل' : 'Open navigation menu'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span class="text-sm font-semibold text-neutral-800">
              {{ authService.currentUser()?.name || '...' }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Language Switcher -->
            <button
              type="button"
              (click)="languageService.toggleLanguage()"
              class="px-2.5 py-1.5 rounded-md border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              {{ languageService.t().LANG_TOGGLE }}
            </button>

            <!-- Notifications Icon Link -->
            <a
              routerLink="/notifications"
              class="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 relative"
              [title]="languageService.t().NAV_NOTIFICATIONS"
              [attr.aria-label]="languageService.t().NAV_NOTIFICATIONS"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </a>

            <!-- User Dropdown Menu Trigger -->
            <div class="relative">
              <button
                type="button"
                (click)="isUserMenuOpen.set(!isUserMenuOpen())"
                class="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 focus:outline-none cursor-pointer"
                [attr.aria-label]="languageService.isRtl() ? 'قائمة المستخدم' : 'User menu'"
              >
                <div class="w-8 h-8 rounded-full bg-primary text-white font-semibold flex items-center justify-center text-xs">
                  {{ authService.currentUser()?.name?.charAt(0) || 'U' }}
                </div>
              </button>

              @if (isUserMenuOpen()) {
                <div
                  class="absolute end-0 mt-2 w-48 bg-white rounded-card shadow-lg border border-neutral-200 py-1.5 z-50"
                  (click)="isUserMenuOpen.set(false)"
                >
                  <div class="px-3 py-2 border-b border-neutral-100">
                    <p class="text-xs font-semibold text-neutral-900 truncate">{{ authService.currentUser()?.name }}</p>
                    <p class="text-[11px] text-neutral-500 truncate">{{ authService.currentUser()?.email }}</p>
                  </div>
                  <a routerLink="/profile" class="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50">
                    {{ languageService.t().NAV_PROFILE }}
                  </a>
                  <button
                    type="button"
                    (click)="authService.logout()"
                    class="w-full text-start flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger-bg cursor-pointer"
                  >
                    {{ languageService.t().NAV_LOGOUT }}
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Main Content Slot -->
        <main class="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-24 md:pb-6">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Slide-Over Drawer (< 768px) -->
      @if (isMobileDrawerOpen()) {
        <div class="fixed inset-0 z-50 md:hidden flex">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
            (click)="isMobileDrawerOpen.set(false)"
          ></div>

          <!-- Drawer Container -->
          <aside class="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10">
            <div class="h-16 flex items-center justify-between px-4 border-b border-neutral-200 bg-neutral-50/50">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center p-0.5 border border-primary-100">
                  <img src="/assets/logo/logo-mark.png" alt="Dawwarha" class="w-full h-full object-contain" />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-neutral-900">{{ languageService.t().BRAND_NAME }}</span>
                  <span class="text-xs text-primary font-semibold leading-none">{{ languageService.t().BRAND_NAME_AR }}</span>
                </div>
              </div>
              <button
                type="button"
                (click)="isMobileDrawerOpen.set(false)"
                class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                [attr.aria-label]="languageService.isRtl() ? 'إغلاق قائمة التنقل' : 'Close navigation menu'"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Drawer Links -->
            <nav class="flex-1 overflow-y-auto p-3 space-y-1 text-sm font-medium" (click)="isMobileDrawerOpen.set(false)">
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                [routerLinkActiveOptions]="{ exact: true }"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{{ languageService.t().NAV_DASHBOARD }}</span>
              </a>

              <a
                routerLink="/resources"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>{{ languageService.t().NAV_RESOURCES }}</span>
              </a>

              <a
                routerLink="/resources/mine"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>{{ languageService.t().NAV_MY_RESOURCES }}</span>
              </a>

              <a
                routerLink="/requests"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{{ languageService.t().NAV_REQUESTS }}</span>
              </a>

              <a
                routerLink="/requests/mine"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{{ languageService.t().NAV_MY_REQUESTS }}</span>
              </a>

              <a
                routerLink="/matches"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{{ languageService.t().NAV_MATCHES }}</span>
              </a>

              <a
                routerLink="/contributions"
                routerLinkActive="bg-sand-50 text-sand-700 font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0 text-sand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{{ languageService.t().NAV_CONTRIBUTIONS }}</span>
              </a>

              <a
                routerLink="/notifications"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>{{ languageService.t().NAV_NOTIFICATIONS }}</span>
              </a>

              <a
                routerLink="/profile"
                routerLinkActive="bg-primary-50 text-primary font-semibold"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ languageService.t().NAV_PROFILE }}</span>
              </a>

              @if (authService.isOrganization()) {
                <div class="pt-2 mt-2 border-t border-neutral-100">
                  <a
                    routerLink="/organizations/dashboard"
                    routerLinkActive="bg-primary-50 text-primary font-semibold"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
                  >
                    <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{{ languageService.t().NAV_ORG_DASHBOARD }}</span>
                  </a>
                </div>
              }

              @if (authService.isAdmin()) {
                <div class="pt-2 mt-2 border-t border-neutral-100">
                  <a
                    routerLink="/admin"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold bg-neutral-900 text-white"
                  >
                    <svg class="w-5 h-5 shrink-0 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ languageService.t().NAV_ADMIN }}</span>
                  </a>
                </div>
              }
            </nav>

            <div class="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                  {{ authService.currentUser()?.name?.charAt(0) || 'U' }}
                </div>
                <p class="text-xs font-semibold text-neutral-800 truncate">{{ authService.currentUser()?.name }}</p>
              </div>
              <button
                type="button"
                (click)="authService.logout()"
                class="text-xs text-danger hover:underline font-semibold cursor-pointer"
              >
                {{ languageService.t().NAV_LOGOUT }}
              </button>
            </div>
          </aside>
        </div>
      }

      <!-- Mobile Bottom Navigation Bar (5 Primary Items) -->
      <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 flex items-center justify-around h-16 z-40 px-1">
        <a routerLink="/dashboard" routerLinkActive="text-primary font-semibold" class="flex flex-col items-center gap-1 text-[10px] text-neutral-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>{{ languageService.t().NAV_DASHBOARD }}</span>
        </a>

        <a routerLink="/resources" routerLinkActive="text-primary font-semibold" class="flex flex-col items-center gap-1 text-[10px] text-neutral-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>{{ languageService.t().NAV_RESOURCES }}</span>
        </a>

        <a routerLink="/matches" routerLinkActive="text-primary font-semibold" class="flex flex-col items-center gap-1 text-[10px] text-neutral-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{{ languageService.t().NAV_MATCHES }}</span>
        </a>

        <a routerLink="/contributions" routerLinkActive="text-sand-600 font-semibold" class="flex flex-col items-center gap-1 text-[10px] text-neutral-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{{ languageService.t().NAV_CONTRIBUTIONS }}</span>
        </a>

        <a routerLink="/profile" routerLinkActive="text-primary font-semibold" class="flex flex-col items-center gap-1 text-[10px] text-neutral-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{{ languageService.t().NAV_PROFILE }}</span>
        </a>
      </nav>
    </div>
  `
})
export class AppLayoutComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  isCollapsed = signal(false);
  isUserMenuOpen = signal(false);
  isMobileDrawerOpen = signal(false);
}

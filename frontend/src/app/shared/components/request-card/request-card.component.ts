import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Request } from '../../../core/models/request.model';
import { UrgencyBadgeComponent } from '../urgency-badge/urgency-badge.component';
import { LanguageService, injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule, RouterLink, UrgencyBadgeComponent],
  template: `
    @if (variant === 'compact') {
      <div
        class="rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition-all"
        [attr.aria-label]="categoryName + ' - ' + quantityLabel + ' ' + (request.quantity || 1) + ', ' + locationText"
      >
        <div class="flex items-center justify-between border-b border-neutral-200/60 pb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {{ isArabic ? 'طلب احتياج' : 'Target Request' }}
          </span>
          <span class="rounded-md bg-neutral-200/60 px-2 py-0.5 text-xs font-semibold text-neutral-700">
            {{ quantityLabel }}: {{ request.quantity || 1 }}
          </span>
        </div>

        <div class="mt-2.5">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-semibold text-neutral-900">
              {{ categoryName }}
            </h4>
            <app-urgency-badge [urgency]="request.urgency || 'medium'" />
          </div>

          <p class="mt-1 flex items-center gap-1 text-xs text-neutral-600">
            <svg class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ locationText }}</span>
          </p>
        </div>
      </div>
    } @else {
      <a
        [routerLink]="['/requests', requestId]"
        class="group block rounded-card border border-neutral-200 bg-neutral-0 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
        [attr.aria-label]="categoryName + ' - ' + quantityLabel + ' ' + request.quantity + ', ' + locationText"
      >
        <!-- Header: Category & Status / Urgency -->
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <div>
              <h3 class="font-bold text-neutral-900 transition-colors group-hover:text-primary-700">
                {{ categoryName }}
              </h3>
              <span class="inline-block rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                {{ isArabic ? 'الكمية المطلوبة' : 'Requested' }}: {{ request.quantity }} {{ isArabic ? 'عنصر' : 'items' }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <app-urgency-badge [urgency]="request.urgency" />

            <span
              class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize"
              [ngClass]="statusBadgeClass"
            >
              {{ statusLabel }}
            </span>
          </div>
        </div>

        @if (request.description) {
          <p class="mt-3 line-clamp-2 text-sm text-neutral-600">
            {{ request.description }}
          </p>
        }

        <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <span class="flex items-center gap-1 text-neutral-700">
            <svg class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ locationText }}
          </span>

          <span class="inline-flex items-center gap-1 font-medium text-primary-600 group-hover:underline">
            {{ languageService?.t()?.COMMON_VIEW_DETAILS || 'View Details' }}
            <svg class="h-3 w-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </a>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RequestCardComponent {
  languageService = injectLanguageService();

  @Input({ required: true }) request!: Request;
  @Input() variant: 'default' | 'compact' = 'default';

  get isArabic(): boolean {
    return this.languageService?.currentLanguage() === 'ar';
  }

  get quantityLabel(): string {
    return this.isArabic ? 'الكمية' : 'Qty';
  }

  get requestId(): string {
    return this.request?._id || this.request?.id || '';
  }

  get categoryName(): string {
    if (this.languageService) {
      const cat = this.request?.categoryId;
      const label = this.languageService.getCategoryLabel(cat);
      if (label && label !== '[object Object]') return label;
    }
    const cat = this.request?.categoryId;
    if (typeof cat === 'object' && cat?.name) {
      return cat.name;
    }
    if (typeof cat === 'string') {
      return cat;
    }
    return this.isArabic ? 'طلب احتياج' : 'Demand Request';
  }

  get locationText(): string {
    const loc = this.request?.location;
    if (!loc) return this.isArabic ? 'الموقع غير محدد' : 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
  }

  get statusLabel(): string {
    const s = this.request?.status;
    if (!s) return '';
    if (this.languageService) {
      return this.languageService.getStatusLabel(s);
    }
    return s;
  }

  get statusBadgeClass(): string {
    switch (this.request?.status) {
      case 'published':
        return 'bg-info-bg text-info border-info/30';
      case 'matched':
        return 'bg-primary-100 text-primary-800 border-primary-500/30';
      case 'accepted':
      case 'fulfilled':
        return 'bg-success-bg text-success border-success/30';
      case 'cancelled':
      case 'expired':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      case 'draft':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }
}
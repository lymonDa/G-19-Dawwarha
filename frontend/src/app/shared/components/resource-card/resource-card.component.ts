import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Resource, ResourceStatus } from '../../../core/models/resource.model';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (variant === 'compact') {
      <div
        class="rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition-all"
        [attr.aria-label]="categoryName + ' resource: ' + (resource.title || 'Untitled') + ', quantity ' + (resource.quantity || 1) + ', location ' + locationText"
      >
        <div class="flex items-center justify-between border-b border-neutral-200/60 pb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Supplied Resource
          </span>
          <span class="rounded-md bg-neutral-200/60 px-2 py-0.5 text-xs font-semibold text-neutral-700">
            Qty: {{ resource.quantity || 1 }}
          </span>
        </div>

        <div class="mt-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="font-semibold text-neutral-900 line-clamp-1">
                {{ resource.title }}
              </h4>
              <p class="text-xs text-primary-700 font-medium mt-0.5">
                {{ categoryName }}
              </p>
            </div>
            <span
              class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize shrink-0"
              [ngClass]="statusBadgeClass"
            >
              {{ statusLabel }}
            </span>
          </div>

          <p class="mt-2 flex items-center gap-1 text-xs text-neutral-600">
            <svg class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ locationText }}</span>
          </p>

          @if (availabilityText) {
            <p class="mt-1 flex items-center gap-1 text-xs text-neutral-500">
              <svg class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ availabilityText }}</span>
            </p>
          }
        </div>
      </div>
    } @else {
      <a
        [routerLink]="['/resources', resourceId]"
        class="group block rounded-card border border-neutral-200 bg-neutral-0 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
        [attr.aria-label]="categoryName + ' resource: ' + resource.title + ', quantity ' + resource.quantity + ', location ' + locationText"
      >
        <!-- Header: Category & Status -->
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <div>
              <span class="inline-block text-xs font-bold text-primary-700 uppercase tracking-wider">
                {{ categoryName }}
              </span>
              <h3 class="font-bold text-neutral-900 transition-colors group-hover:text-primary-700 text-base leading-snug line-clamp-1">
                {{ resource.title }}
              </h3>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <span
              class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize"
              [ngClass]="statusBadgeClass"
            >
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <!-- Description -->
        @if (resource.description) {
          <p class="mt-3 line-clamp-2 text-sm text-neutral-600">
            {{ resource.description }}
          </p>
        }

        <!-- Meta specs: Quantity & Availability Window -->
        <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span class="rounded bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
            Qty: {{ resource.quantity }}
          </span>

          @if (availabilityText) {
            <span class="flex items-center gap-1 text-neutral-600">
              <svg class="h-3.5 w-3.5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ availabilityText }}</span>
            </span>
          }
        </div>

        <!-- Footer: Location & Action link -->
        <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <span class="flex items-center gap-1 text-neutral-700">
            <svg class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ locationText }}
          </span>

          <span class="inline-flex items-center gap-1 font-medium text-primary-600 group-hover:underline">
            View Details
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
export class ResourceCardComponent {
  @Input({ required: true }) resource!: Resource;
  @Input() variant: 'default' | 'compact' = 'default';

  get resourceId(): string {
    return this.resource?._id || this.resource?.id || '';
  }

  get categoryName(): string {
    if (this.resource?.category?.name) {
      return this.resource.category.name;
    }
    const cat = this.resource?.categoryId;
    if (typeof cat === 'object' && cat && (cat as any).name) {
      return (cat as any).name;
    }
    if (typeof cat === 'string' && cat.length > 0) {
      return 'Category';
    }
    return 'General Resource';
  }

  get locationText(): string {
    const loc = this.resource?.location;
    if (!loc || !loc.city) return 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
  }

  get availabilityText(): string | null {
    const win = this.resource?.availabilityWindow;
    if (!win || !win.start || !win.end) return null;
    try {
      const s = new Date(win.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const e = new Date(win.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${s} – ${e}`;
    } catch {
      return null;
    }
  }

  get statusLabel(): string {
    const s = this.resource?.status;
    if (!s) return 'Draft';
    switch (s) {
      case 'in_handover':
        return 'In Handover';
      case 'impact_recorded':
        return 'Impact Logged';
      default:
        return s
          .split('_')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
    }
  }

  get statusBadgeClass(): string {
    switch (this.resource?.status) {
      case 'published':
      case 'available':
        return 'bg-success-bg text-success border-success/30';
      case 'matched':
        return 'bg-primary-100 text-primary-800 border-primary-500/30';
      case 'accepted':
      case 'in_handover':
        return 'bg-warning-bg text-warning border-warning/30';
      case 'completed':
      case 'impact_recorded':
        return 'bg-success-bg text-success border-success/30';
      case 'unavailable':
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
      case 'cancelled':
      case 'expired':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      case 'draft':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';
import { Request, RequestStatus, RequestUrgency } from '../../../core/models/request.model';
import { Category } from '../../../core/models/category.model';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RequestCardComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <!-- Header Section -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-neutral-900">
              {{ languageService.t().REQ_BROWSE_TITLE }}
            </h1>
            <p class="mt-1 text-sm text-neutral-500">
              {{ languageService.t().REQ_BROWSE_SUBTITLE }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a
              routerLink="/requests/mine"
              class="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              {{ languageService.t().NAV_MY_REQUESTS }}
            </a>
            <a
              routerLink="/requests/create"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ {{ languageService.t().REQ_REGISTER_NEED_BTN }}</span>
            </a>
          </div>
        </div>

        <!-- Filter Bar (Guided & Responsive with RTL Logical Styling) -->
        <div class="mt-6 rounded-card border border-neutral-200 bg-neutral-0 p-4 shadow-sm">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <!-- Search Input with Logical RTL Positioning -->
            <div class="relative lg:col-span-2">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
                [placeholder]="languageService.isRtl() ? 'ابحث بالكلمة المفتاحية، المدينة، أو التصنيف...' : 'Search by keyword, city, or category...'"
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 ps-9 pe-3 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
                [attr.aria-label]="languageService.t().COMMON_SEARCH"
              />
              <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-neutral-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- Category Filter -->
            <div>
              <select
                [title]="languageService.t().COMMON_CATEGORY"
                [attr.aria-label]="languageService.t().COMMON_CATEGORY"
                [(ngModel)]="selectedCategory"
                (change)="onFilterChange()"
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value="">{{ languageService.t().COMMON_ALL_CATEGORIES }}</option>
                @for (cat of categories; track cat._id || cat.id) {
                  <option [value]="cat._id || cat.id">{{ languageService.getCategoryLabel(cat) }}</option>
                }
              </select>
            </div>

            <!-- Urgency Filter -->
            <div>
              <select
                [title]="languageService.t().COMMON_URGENCY"
                [attr.aria-label]="languageService.t().COMMON_URGENCY"
                [(ngModel)]="selectedUrgency"
                (change)="onFilterChange()"
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value="">{{ languageService.isRtl() ? 'جميع درجات الإلحاح' : 'All Urgencies' }}</option>
                <option value="high">{{ languageService.getUrgencyLabel('high') }}</option>
                <option value="medium">{{ languageService.getUrgencyLabel('medium') }}</option>
                <option value="low">{{ languageService.getUrgencyLabel('low') }}</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <select
                [title]="languageService.t().COMMON_STATUS"
                [attr.aria-label]="languageService.t().COMMON_STATUS"
                [(ngModel)]="selectedStatus"
                (change)="onFilterChange()"
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value="">{{ languageService.isRtl() ? 'جميع الحالات' : 'All Statuses' }}</option>
                <option value="published">{{ languageService.getStatusLabel('published') }}</option>
                <option value="matched">{{ languageService.getStatusLabel('matched') }}</option>
                <option value="accepted">{{ languageService.getStatusLabel('accepted') }}</option>
                <option value="fulfilled">{{ languageService.getStatusLabel('fulfilled') }}</option>
                <option value="draft">{{ languageService.getStatusLabel('draft') }}</option>
                <option value="cancelled">{{ languageService.getStatusLabel('cancelled') }}</option>
              </select>
            </div>
          </div>

          <!-- Active filters indicator and reset button -->
          @if (searchTerm || selectedCategory || selectedUrgency || selectedStatus || selectedCity) {
            <div class="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
              <span>{{ languageService.isRtl() ? 'عوامل التصفية النشطة مطبقة' : 'Active filters applied' }}</span>
              <button
                type="button"
                (click)="resetFilters()"
                class="font-medium text-primary-600 hover:text-primary-800"
              >
                {{ languageService.t().COMMON_CLEAR_FILTERS }}
              </button>
            </div>
          }
        </div>

        <!-- Error State -->
        @if (errorMessage) {
          <div class="mt-6 rounded-card border border-danger/30 bg-danger-bg p-4 text-sm text-danger" role="alert">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ errorMessage }}</span>
              </div>
              <button
                (click)="loadRequests(true)"
                class="rounded bg-danger px-3 py-1 text-xs font-semibold text-white hover:bg-danger/90"
              >
                {{ languageService.t().COMMON_RETRY }}
              </button>
            </div>
          </div>
        }

        <!-- Content Area -->
        <div class="mt-6">
          @if (loading) {
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              @for (item of [1, 2, 3, 4, 5, 6]; track item) {
                <app-skeleton variant="card" height="190px" />
              }
            </div>
          } @else if (filteredRequests.length === 0) {
            <app-empty-state
              [title]="languageService.t().REQ_EMPTY_TITLE"
              [description]="searchTerm || selectedCategory || selectedUrgency || selectedStatus ? languageService.t().REQ_EMPTY_DESC : (languageService.isRtl() ? 'لا توجد طلبات احتياج نشطة حالياً في المنصة.' : 'There are currently no active demand requests on the platform.')"
              [actionLabel]="searchTerm || selectedCategory || selectedUrgency || selectedStatus ? languageService.t().COMMON_RESET_FILTERS : languageService.t().REQ_REGISTER_NEED_BTN"
              (actionClicked)="searchTerm || selectedCategory || selectedUrgency || selectedStatus ? resetFilters() : navigateToCreate()"
            />
          } @else {
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              @for (req of filteredRequests; track req._id || req.id) {
                <app-request-card [request]="req" />
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RequestListComponent implements OnInit {
  languageService = inject(LanguageService);
  private api = inject(RequestApiService);
  private router = inject(Router);

  requests: Request[] = [];
  categories: Category[] = [];

  // Filter models
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: RequestStatus | '' = '';
  selectedUrgency: RequestUrgency | '' = '';
  selectedCity = '';

  loading = true;
  errorMessage = '';

  // Pagination
  page = 1;
  limit = 12;
  hasMore = false;
  total = 0;

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadCategories();
    this.loadRequests();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories = Array.isArray(res) ? res : [];
      },
      error: () => {
        // Non-fatal category loading failure
      }
    });
  }

  loadRequests(resetPage = true): void {
    if (resetPage) {
      this.page = 1;
    }
    this.loading = true;
    this.errorMessage = '';

    this.api.getAll(
      this.page,
      this.limit,
      this.selectedStatus || undefined,
      this.selectedCategory || undefined,
      this.selectedCity || undefined,
      this.selectedUrgency || undefined
    ).subscribe({
      next: (response) => {
        const items = response.data || [];
        this.requests = items;
        this.total = response.pagination?.total || items.length;
        this.hasMore = items.length >= this.limit;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load requests. Please try again.';
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadRequests(true);
    }, 300);
  }

  onFilterChange(): void {
    this.loadRequests(true);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedUrgency = '';
    this.selectedCity = '';
    this.loadRequests(true);
  }

  navigateToCreate(): void {
    this.router.navigate(['/requests/create']);
  }

  get filteredRequests(): Request[] {
    let list = this.requests;

    /**
     * CROSS-ENGINEER CONTRACT GAP:
     * Backend requests.controller.js ignores the 'urgency' query parameter on GET /api/requests.
     * This bounded client-side filter provides the required urgency filtering UX.
     */
    if (this.selectedUrgency) {
      list = list.filter(
        (req) => (req.urgency || '').toLowerCase() === this.selectedUrgency.toLowerCase()
      );
    }

    if (!this.searchTerm.trim()) {
      return list;
    }

    const q = this.searchTerm.toLowerCase();
    return list.filter((req) => {
      const desc = (req.description || '').toLowerCase();
      const city = (req.location?.city || '').toLowerCase();
      const area = (req.location?.area || '').toLowerCase();
      const catName =
        typeof req.categoryId === 'object' && req.categoryId?.name
          ? req.categoryId.name.toLowerCase()
          : '';
      return desc.includes(q) || city.includes(q) || area.includes(q) || catName.includes(q);
    });
  }
}

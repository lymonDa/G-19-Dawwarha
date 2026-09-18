import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
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
              Discover Demand Requests
            </h1>
            <p class="mt-1 text-sm text-neutral-500">
              Explore urgent community needs and supplies requested across regions.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a
              routerLink="/requests/mine"
              class="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              My Requests
            </a>
            <a
              routerLink="/requests/create"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Request</span>
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
                placeholder="Search by keyword, city, or category..."
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 ps-9 pe-3 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
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
                title="Filter by category"
                aria-label="Filter by category"
                [(ngModel)]="selectedCategory"
                (change)="onFilterChange()"
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value="">All Categories</option>
                @for (cat of categories; track cat._id || cat.id) {
                  <option [value]="cat._id || cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Urgency Filter -->
            <div>
              <select
                title="Filter by urgency"
                aria-label="Filter by urgency"
                [(ngModel)]="selectedUrgency"
                (change)="onFilterChange()"
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value="">All Urgencies</option>
                <option value="high">High Urgency</option>
                <option value="medium">Medium Urgency</option>
                <option value="low">Low Urgency</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <select
                title="Filter by status"
                aria-label="Filter by status"
                [(ngModel)]="selectedStatus"
                (change)="onFilterChange()"
                class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 transition focus:border-primary-600 focus:bg-neutral-0 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="matched">Matched</option>
                <option value="accepted">Accepted</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <!-- Active filters indicator and reset button -->
          @if (searchTerm || selectedCategory || selectedUrgency || selectedStatus || selectedCity) {
            <div class="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
              <span>Active filters applied</span>
              <button
                type="button"
                (click)="resetFilters()"
                class="font-medium text-primary-600 hover:text-primary-800"
              >
                Clear all filters
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
                Retry
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
              title="No requests found"
              [description]="searchTerm || selectedCategory || selectedUrgency || selectedStatus ? 'No results match your active filters. Try resetting or adjusting your search criteria.' : 'There are currently no active demand requests on the platform.'"
              [actionLabel]="searchTerm || selectedCategory || selectedUrgency || selectedStatus ? 'Reset Filters' : 'Post a Request'"
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

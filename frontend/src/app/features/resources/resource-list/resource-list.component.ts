import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ResourceApiService } from '../resource-api.service';
import { CategoryApiService } from '../../categories/category-api.service';
import { Resource } from '../../../core/models/resource.model';
import { Category } from '../../../core/models/category.model';
import { ResourceCardComponent } from '../../../shared/components/resource-card/resource-card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ResourceCardComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl flex flex-col gap-6">
        <!-- Header Row -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Browse Available Resources
            </h1>
            <p class="text-sm text-neutral-500 mt-1">
              Explore surplus equipment, materials, and supplies ready for civic redistribution and matching.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a
              routerLink="/resources/mine"
              class="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50"
            >
              My Listings
            </a>
            <a
              routerLink="/resources/create"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-primary-500"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ List a Resource</span>
            </a>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="rounded-card border border-neutral-200 bg-neutral-0 p-4 shadow-xs flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <!-- Keyword Search -->
            <div class="relative">
              <input
                type="text"
                placeholder="Search resources by title or description..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                class="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Search resources"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="absolute inset-y-0 end-2 flex items-center text-xs text-neutral-400 hover:text-neutral-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              }
            </div>

            <!-- City Filter -->
            <div>
              <input
                type="text"
                placeholder="Filter by city (e.g. Cairo, Giza)..."
                [(ngModel)]="cityFilter"
                (ngModelChange)="onFilterChange()"
                class="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Filter by city"
              />
            </div>

            <!-- Reset Filters -->
            @if (hasActiveFilters) {
              <div class="flex items-center">
                <button
                  type="button"
                  (click)="resetFilters()"
                  class="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  Reset all filters
                </button>
              </div>
            }
          </div>

          <!-- Dynamic Category Chips -->
          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
            <span class="text-xs font-semibold text-neutral-500 me-1">Category:</span>

            <button
              type="button"
              (click)="selectCategory(null)"
              class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              [ngClass]="selectedCategoryId === null ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
            >
              All Categories
            </button>

            @for (cat of categories(); track (cat.id || cat._id)) {
              <button
                type="button"
                (click)="selectCategory(cat.id || cat._id || null)"
                class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                [ngClass]="selectedCategoryId === (cat.id || cat._id) ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
              >
                {{ cat.name }}
              </button>
            }
          </div>
        </div>

        <!-- Error State -->
        @if (errorMessage) {
          <div class="rounded-card border border-danger/30 bg-danger-bg p-4 text-sm text-danger flex items-center justify-between" role="alert">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
            <app-button variant="outline" size="sm" (clicked)="fetchResources()">Retry</app-button>
          </div>
        }

        <!-- Loading State: Skeletons -->
        @if (isLoading) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="rounded-card border border-neutral-200 bg-neutral-0 p-5 space-y-4">
                <app-skeleton variant="text" width="40%" height="16px"></app-skeleton>
                <app-skeleton variant="text" width="80%" height="20px"></app-skeleton>
                <app-skeleton variant="rectangular" height="48px"></app-skeleton>
                <div class="pt-3 border-t border-neutral-100 flex justify-between">
                  <app-skeleton variant="text" width="30%" height="14px"></app-skeleton>
                  <app-skeleton variant="text" width="30%" height="14px"></app-skeleton>
                </div>
              </div>
            }
          </div>
        } @else if (displayedResources().length === 0) {
          <!-- Empty State -->
          <div class="rounded-card border border-neutral-200 bg-neutral-0 p-12 text-center">
            <app-empty-state
              title="No resources found"
              description="No surplus listings match your current filter criteria. Try adjusting your search query or clear filters to see more results."
              actionLabel="Clear Filters"
              (actionClicked)="resetFilters()"
            ></app-empty-state>
          </div>
        } @else {
          <!-- Populated Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (resource of displayedResources(); track resource.id) {
              <app-resource-card [resource]="resource"></app-resource-card>
            }
          </div>

          <!-- Pagination Bar -->
          @if (totalPages > 1) {
            <div class="flex items-center justify-between border-t border-neutral-200 pt-4 px-2 text-xs text-neutral-600">
              <span>Showing page {{ currentPage }} of {{ totalPages }} ({{ totalCount }} total resources)</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  [disabled]="currentPage <= 1"
                  (click)="goToPage(currentPage - 1)"
                  class="rounded border border-neutral-300 px-3 py-1.5 font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  [disabled]="currentPage >= totalPages"
                  (click)="goToPage(currentPage + 1)"
                  class="rounded border border-neutral-300 px-3 py-1.5 font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ResourceListComponent implements OnInit {
  private resourceApi = inject(ResourceApiService);
  private categoryApi = inject(CategoryApiService);

  isLoading = true;
  errorMessage: string | null = null;
  readonly _searchQuery = signal('');

  get searchQuery(): string {
    return this._searchQuery();
  }

  set searchQuery(val: string) {
    this._searchQuery.set(val || '');
  }

  cityFilter = '';
  selectedCategoryId: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  private readonly pageSize = 12;

  readonly rawResources = signal<Resource[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly displayedResources = computed(() => {
    const list = this.rawResources();
    const query = this._searchQuery().trim().toLowerCase();
    if (!query) return list;

    return list.filter(r =>
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query)) ||
      (r.location?.city && r.location.city.toLowerCase().includes(query)) ||
      (r.location?.area && r.location.area.toLowerCase().includes(query))
    );
  });

  get hasActiveFilters(): boolean {
    return Boolean(this.searchQuery || this.cityFilter || this.selectedCategoryId);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.fetchResources();
  }

  loadCategories(): void {
    this.categoryApi.list().subscribe({
      next: (cats) => {
        this.categories.set(cats.filter(c => c.isActive));
      },
      error: () => {
        // Soft fail on categories list; filter chips will simply not show
      }
    });
  }

  fetchResources(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.resourceApi.list({
      categoryId: this.selectedCategoryId || undefined,
      city: this.cityFilter.trim() || undefined,
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (page) => {
        this.isLoading = false;
        this.rawResources.set(page.items);
        this.totalCount = page.total;
        this.totalPages = page.totalPages;
        this.currentPage = page.page;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error?.message || err?.error?.message || 'Could not load resources. Please try again.';
      }
    });
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.fetchResources();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchResources();
  }

  onSearchChange(): void {
    // Triggers client-side computed filtering reactively
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.cityFilter = '';
    this.selectedCategoryId = null;
    this.currentPage = 1;
    this.fetchResources();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchResources();
  }
}

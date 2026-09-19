import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ResourceApiService } from '../resource-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Resource, ResourceStatus } from '../../../core/models/resource.model';
import { ResourceCardComponent } from '../../../shared/components/resource-card/resource-card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

interface StatusTab {
  id: string;
  label: string;
  statuses?: ResourceStatus[];
}

@Component({
  selector: 'app-my-resources',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ResourceCardComponent,
    ButtonComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl flex flex-col gap-6">
        <!-- Header Row -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              My Listed Resources
            </h1>
            <p class="text-sm text-neutral-500 mt-1">
              Manage your surplus listings, monitor lifecycle updates, and track matched demands.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a
              routerLink="/resources"
              class="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50"
            >
              Browse Public Feed
            </a>
            <a
              routerLink="/resources/create"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-primary-500"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ List New Resource</span>
            </a>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="border-b border-neutral-200">
          <nav class="-mb-px flex gap-2 overflow-x-auto pb-1" aria-label="Resource Status Tabs" role="tablist">
            @for (tab of tabs; track tab.id) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="selectedTab() === tab.id"
                (click)="selectTab(tab.id)"
                class="whitespace-nowrap border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-colors"
                [ngClass]="selectedTab() === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'"
              >
                {{ tab.label }}
                <span
                  class="ms-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  [ngClass]="selectedTab() === tab.id ? 'bg-primary-50 text-primary' : 'bg-neutral-100 text-neutral-600'"
                >
                  {{ getCountForTab(tab.id) }}
                </span>
              </button>
            }
          </nav>
        </div>

        <!-- Error State -->
        @if (errorMessage()) {
          <div class="rounded-card border border-danger/30 bg-danger-bg p-4 text-sm text-danger flex items-center justify-between" role="alert">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
            <app-button variant="outline" size="sm" (clicked)="fetchMyResources()">Retry</app-button>
          </div>
        }

        <!-- Loading Skeletons -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="rounded-card border border-neutral-200 bg-neutral-0 p-5 space-y-3">
                <app-skeleton variant="text" width="50%" height="16px"></app-skeleton>
                <app-skeleton variant="text" width="80%" height="20px"></app-skeleton>
                <app-skeleton variant="rectangular" height="40px"></app-skeleton>
              </div>
            }
          </div>
        } @else if (displayedResources().length === 0) {
          <!-- Empty State -->
          <div class="rounded-card border border-neutral-200 bg-neutral-0 p-12 text-center">
            <app-empty-state
              title="No resources found"
              description="You have no surplus listings in this status. Register your first item to begin offering civic resources."
              actionLabel="+ List New Resource"
              (actionClicked)="navigateCreate()"
            ></app-empty-state>
          </div>
        } @else {
          <!-- Resource Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (res of displayedResources(); track res.id) {
              <div class="flex flex-col gap-2">
                <app-resource-card [resource]="res" variant="default"></app-resource-card>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class MyResourcesComponent implements OnInit {
  private resourceApi = inject(ResourceApiService);
  private authService = inject(AuthService);

  readonly resources = signal<Resource[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedTab = signal<string>('all');

  readonly tabs: StatusTab[] = [
    { id: 'all', label: 'All Listings' },
    { id: 'available', label: 'Available', statuses: ['available', 'published'] },
    { id: 'progress', label: 'In Progress', statuses: ['matched', 'accepted', 'in_handover'] },
    { id: 'completed', label: 'Completed', statuses: ['completed', 'impact_recorded'] },
    { id: 'inactive', label: 'Inactive / Draft', statuses: ['draft', 'unavailable', 'cancelled', 'expired'] }
  ];

  readonly displayedResources = computed(() => {
    const list = this.resources();
    const tabId = this.selectedTab();
    if (tabId === 'all') return list;

    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !tab.statuses) return list;

    return list.filter(r => tab.statuses!.includes(r.status));
  });

  ngOnInit(): void {
    this.fetchMyResources();
  }

  fetchMyResources(): void {
    const user = this.authService.currentUser();
    const userId = user?.id || user?._id;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.resourceApi.listMine(userId || '').subscribe({
      next: (items) => {
        this.isLoading.set(false);
        this.resources.set(items);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.error?.message || err?.error?.message || 'Failed to load your resources.');
      }
    });
  }

  selectTab(tabId: string): void {
    this.selectedTab.set(tabId);
  }

  getCountForTab(tabId: string): number {
    const list = this.resources();
    if (tabId === 'all') return list.length;
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !tab.statuses) return 0;
    return list.filter(r => tab.statuses!.includes(r.status)).length;
  }

  navigateCreate(): void {
    // Navigation is handled via template link
  }
}

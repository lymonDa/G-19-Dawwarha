import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Request, RequestStatus } from '../../../core/models/request.model';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RequestCardComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <!-- Header Row -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-neutral-900">
              My Requests
            </h1>
            <p class="mt-1 text-sm text-neutral-500">
              Manage, track status, and view active matches for your demand requests.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a
              routerLink="/requests"
              class="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Browse All Requests
            </a>
            <a
              routerLink="/requests/create"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Request</span>
            </a>
          </div>
        </div>

        <!-- Status Tabs (Accessible and RTL-ready) -->
        <div class="mt-6 border-b border-neutral-200">
          <nav class="-mb-px flex gap-2 overflow-x-auto pb-1" aria-label="Status Tabs" role="tablist">
            @for (tab of tabs; track tab.key) {
              <button
                type="button"
                role="tab"
                [id]="'tab-' + tab.key"
                [attr.aria-selected]="activeTab === tab.key"
                (click)="setTab(tab.key)"
                class="group inline-flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition"
                [ngClass]="activeTab === tab.key
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'"
              >
                <span>{{ tab.label }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  [ngClass]="activeTab === tab.key
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'"
                >
                  {{ getCountForTab(tab.key) }}
                </span>
              </button>
            }
          </nav>
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
                type="button"
                (click)="loadMyRequests()"
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
              @for (item of [1, 2, 3]; track item) {
                <app-skeleton variant="card" height="190px" />
              }
            </div>
          } @else if (filteredRequests.length === 0) {
            <app-empty-state
              title="No requests in this category"
              [description]="activeTab === 'all' ? 'You haven\\'t posted any demand requests yet.' : 'You have no requests currently with status &quot;' + activeTab + '&quot;.'"
              actionLabel="Create Your First Request"
              (actionClicked)="navigateToCreate()"
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
export class MyRequestsComponent implements OnInit {
  private api = inject(RequestApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  allRequests: Request[] = [];
  filteredRequests: Request[] = [];
  activeTab: 'all' | RequestStatus = 'all';

  loading = true;
  errorMessage = '';

  readonly tabs: { key: 'all' | RequestStatus; label: string }[] = [
    { key: 'all', label: 'All Requests' },
    { key: 'published', label: 'Published' },
    { key: 'matched', label: 'Matched' },
    { key: 'draft', label: 'Drafts' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'fulfilled', label: 'Fulfilled' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadMyRequests();
  }

  loadMyRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getAll(1, 100).subscribe({
      next: (res) => {
        const list = res.data || [];
        const currentUser = this.auth.currentUser();
        const currentUserId = currentUser?._id || currentUser?.id;

        // If authenticated user ID is available, filter by user; otherwise display list
        if (currentUserId) {
          this.allRequests = list.filter((r: any) => {
            const requester = typeof r.requesterId === 'object'
              ? r.requesterId?._id || r.requesterId?.id
              : r.requesterId;
            return String(requester) === String(currentUserId);
          });
        } else {
          this.allRequests = list;
        }

        this.applyTabFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load your requests.';
      }
    });
  }

  setTab(tab: 'all' | RequestStatus): void {
    this.activeTab = tab;
    this.applyTabFilter();
  }

  applyTabFilter(): void {
    if (this.activeTab === 'all') {
      this.filteredRequests = this.allRequests;
    } else {
      this.filteredRequests = this.allRequests.filter(
        r => r.status === this.activeTab
      );
    }
  }

  getCountForTab(tabKey: 'all' | RequestStatus): number {
    if (tabKey === 'all') return this.allRequests.length;
    return this.allRequests.filter(r => r.status === tabKey).length;
  }

  navigateToCreate(): void {
    this.router.navigate(['/requests/create']);
  }
}

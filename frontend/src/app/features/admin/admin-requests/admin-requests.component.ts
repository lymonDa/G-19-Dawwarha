import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { RequestApiService } from '../../requests/services/request-api.service';
import { Request } from '../../../core/models/request.model';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableComponent,
    BadgeComponent,
    ButtonComponent,
    SkeletonComponent
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Header Row -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Demand Requests Management</h1>
          <p class="text-xs text-neutral-500 mt-0.5">
            Monitor requests registered by organizations and individuals, and track fulfilment rates and distribution.
          </p>
        </div>
        <app-button variant="outline" size="sm" (clicked)="fetchRequests()">
          Refresh
        </app-button>
      </div>

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="p-3 rounded-md bg-danger-bg border border-danger/20 text-xs text-danger flex items-center justify-between" role="alert">
          <span>{{ errorMessage() }}</span>
          <app-button variant="outline" size="sm" (clicked)="fetchRequests()">Retry</app-button>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="space-y-2">
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
        </div>
      } @else {
        <!-- Requests Table -->
        <app-table>
          <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
            <tr>
              <th class="px-4 py-3 text-start text-xs font-semibold">Request</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">Category</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">Urgency</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">Location</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">Status</th>
              <th class="px-4 py-3 text-end text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 text-xs">
            @for (req of requests(); track (req._id || req.id)) {
              <tr class="hover:bg-neutral-50/80 transition-colors">
                <td class="px-4 py-3 font-semibold text-neutral-900">
                  {{ req.description || getCategoryName(req) }}
                </td>
                <td class="px-4 py-3 text-neutral-600">{{ getCategoryName(req) }}</td>
                <td class="px-4 py-3">
                  <app-badge [variant]="getUrgencyVariant(req.urgency)" size="sm">
                    {{ req.urgency }}
                  </app-badge>
                </td>
                <td class="px-4 py-3 text-neutral-500">{{ req.location.city || 'Cairo' }}</td>
                <td class="px-4 py-3">
                  <app-badge [variant]="getStatusVariant(req.status)" size="sm">
                    {{ req.status }}
                  </app-badge>
                </td>
                <td class="px-4 py-3 text-end">
                  <a [routerLink]="['/requests', req.id || req._id]">
                    <app-button variant="ghost" size="sm">Inspect</app-button>
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-xs text-neutral-500">
                  No demand requests currently registered in the database.
                </td>
              </tr>
            }
          </tbody>
        </app-table>
      }
    </div>
  `
})
export class AdminRequestsComponent implements OnInit {
  private requestApi = inject(RequestApiService);

  readonly requests = signal<Request[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchRequests();
  }

  fetchRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.requestApi.getAll(1, 50).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.requests.set(res.data || []);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.error?.message || err?.error?.message || 'Failed to load requests.');
      }
    });
  }

  getCategoryName(req: Request): string {
    if (typeof req.categoryId === 'object' && req.categoryId && 'name' in req.categoryId) {
      return (req.categoryId as any).name;
    }
    return 'General Request';
  }

  getUrgencyVariant(urgency?: string): 'danger' | 'warning' | 'info' | 'neutral' {
    switch (urgency) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'neutral';
    }
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
    switch (status) {
      case 'published':
      case 'active':
      case 'fulfilled':
      case 'completed':
        return 'success';
      case 'matched':
      case 'accepted':
      case 'in_handover':
        return 'warning';
      case 'draft':
        return 'info';
      case 'cancelled':
      case 'expired':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}

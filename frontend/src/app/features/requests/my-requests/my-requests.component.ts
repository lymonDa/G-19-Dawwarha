<<<<<<< HEAD
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Request, RequestStatus } from '../../../core/models/request.model';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

@Component({
  selector: 'app-my-requests',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterLink, RequestCardComponent],
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.css']
})
export class MyRequestsComponent implements OnInit {
  private api = inject(RequestApiService);
  private auth = inject(AuthService);

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
}
=======
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">My Registered Requests</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Track the status of your demand requests and suggested matches with available resources.</p>
        </div>
        <a routerLink="/requests/create">
          <app-button variant="primary" size="sm">+ New Request</app-button>
        </a>
      </div>

      <div class="space-y-4">
        <app-card padding="md">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Medical Equipment</span>
                <app-badge variant="danger" size="sm">Very Urgent</app-badge>
              </div>
              <h3 class="font-bold text-neutral-900 text-base mt-1">Home Ventilator / Oxygen Cylinder</h3>
              <p class="text-xs text-neutral-500">Dokki · Qty: 1 unit</p>
            </div>
            <a routerLink="/matches">
              <app-button variant="primary" size="sm">View Candidate Matches (3)</app-button>
            </a>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class MyRequestsComponent {}
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Request, RequestStatus } from '../../../core/models/request.model';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';

@Component({
  selector: 'app-my-requests',
  standalone: true,
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
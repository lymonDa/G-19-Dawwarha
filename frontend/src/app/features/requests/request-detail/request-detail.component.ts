import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { Request } from '../../../core/models/request.model';
import { UrgencyBadgeComponent } from '../../../shared/components/urgency-badge/urgency-badge.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, UrgencyBadgeComponent],
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css']
})
export class RequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(RequestApiService);

  request: Request | null = null;
  requestId = '';
  loading = true;
  actionProcessing = false;
  errorMessage = '';
  successMessage = '';

  showCancelConfirm = false;

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    if (this.requestId) {
      this.loadRequest();
    } else {
      this.errorMessage = 'No request ID provided.';
      this.loading = false;
    }
  }

  loadRequest(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.getById(this.requestId).subscribe({
      next: (data) => {
        this.request = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load request details.';
      }
    });
  }

  get categoryName(): string {
    const cat = this.request?.categoryId;
    if (typeof cat === 'object' && cat?.name) {
      return cat.name;
    }
    if (typeof cat === 'string') {
      return cat;
    }
    return 'Demand Request';
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

  publishRequest(): void {
    this.actionProcessing = true;
    this.errorMessage = '';
    this.api.changeStatus(this.requestId, 'publish').subscribe({
      next: (updated) => {
        this.request = updated;
        this.actionProcessing = false;
        this.successMessage = 'Request published successfully and is now discoverable for matching.';
      },
      error: (err) => {
        this.actionProcessing = false;
        this.errorMessage = err?.error?.message || 'Failed to publish request.';
      }
    });
  }

  promptCancel(): void {
    this.showCancelConfirm = true;
  }

  dismissCancel(): void {
    this.showCancelConfirm = false;
  }

  confirmCancel(): void {
    this.showCancelConfirm = false;
    this.actionProcessing = true;
    this.errorMessage = '';
    this.api.changeStatus(this.requestId, 'cancel').subscribe({
      next: (updated) => {
        this.request = updated;
        this.actionProcessing = false;
        this.successMessage = 'Request has been cancelled.';
      },
      error: (err) => {
        this.actionProcessing = false;
        this.errorMessage = err?.error?.message || 'Failed to cancel request.';
      }
    });
  }
}
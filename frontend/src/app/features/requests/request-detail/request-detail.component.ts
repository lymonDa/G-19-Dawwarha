<<<<<<< HEAD
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { Request } from '../../../core/models/request.model';
import { UrgencyBadgeComponent } from '../../../shared/components/urgency-badge/urgency-badge.component';
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

@Component({
  selector: 'app-request-detail',
  standalone: true,
<<<<<<< HEAD
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
=======
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      <a routerLink="/requests" class="text-xs text-neutral-500 hover:text-primary">← Back to Requests</a>
      <app-card padding="lg">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <span class="text-xs text-primary font-bold bg-primary-50 px-2 py-0.5 rounded">Medical Devices & Equipment</span>
            <h1 class="text-2xl font-bold text-neutral-900 mt-2">Home Ventilator / Oxygen Cylinder</h1>
            <p class="text-xs text-neutral-500 mt-1">Dokki, Giza · Verified Request</p>
          </div>
          <app-badge variant="danger">Very Urgent</app-badge>
        </div>
        <p class="text-sm text-neutral-700 leading-relaxed py-4 border-y border-neutral-100">
          Required for a patient with acute respiratory insufficiency who needs the device for continuous home use under medical supervision.
        </p>
        <div class="flex justify-end pt-4">
          <a routerLink="/matches">
            <app-button variant="primary">Find Matching Resources for This Request</app-button>
          </a>
        </div>
      </app-card>
    </div>
  `
})
export class RequestDetailComponent {}
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

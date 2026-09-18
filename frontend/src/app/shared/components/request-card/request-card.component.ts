import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Request } from '../../../core/models/request.model';
import { UrgencyBadgeComponent } from '../urgency-badge/urgency-badge.component';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule, RouterLink, UrgencyBadgeComponent],
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.css']
})
export class RequestCardComponent {
  @Input({ required: true }) request!: Request;

  get requestId(): string {
    return this.request?._id || this.request?.id || '';
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

  get locationText(): string {
    const loc = this.request?.location;
    if (!loc) return 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
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
}
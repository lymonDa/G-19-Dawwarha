import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestUrgency } from '../../../core/models/request.model';

@Component({
  selector: 'app-urgency-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors"
      [ngClass]="badgeClasses"
      role="status"
    >
      @if (normalizedUrgency === 'high') {
        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      } @else if (normalizedUrgency === 'low') {
        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      } @else {
        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      <span>{{ label }}</span>
    </span>
  `
})
export class UrgencyBadgeComponent {
  @Input() urgency: RequestUrgency | string = 'medium';

  get normalizedUrgency(): RequestUrgency {
    const val = (this.urgency || '').toLowerCase();
    if (val === 'high') return 'high';
    if (val === 'low') return 'low';
    return 'medium';
  }

  get label(): string {
    switch (this.normalizedUrgency) {
      case 'high':
        return 'High urgency';
      case 'low':
        return 'Low urgency';
      case 'medium':
      default:
        return 'Medium urgency';
    }
  }

  get badgeClasses(): string {
    switch (this.normalizedUrgency) {
      case 'high':
        return 'bg-danger-bg text-danger border border-danger/20';
      case 'low':
        return 'bg-info-bg text-info border border-info/20';
      case 'medium':
      default:
        return 'bg-warning-bg text-warning border border-warning/20';
    }
  }
}

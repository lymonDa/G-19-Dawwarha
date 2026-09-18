import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestUrgency } from '../../../core/models/request.model';

@Component({
  selector: 'app-urgency-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urgency-badge.component.html'
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

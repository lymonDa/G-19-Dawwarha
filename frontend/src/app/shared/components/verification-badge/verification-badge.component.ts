import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationVerificationStatus } from '../../../core/models/organization.model';

@Component({
  selector: 'app-verification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (status === 'verified') {
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-500/20"
        title="منظمة موثقة ومتحقق منها رسمياً"
      >
        <svg class="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>موثقة</span>
      </span>
    } @else if (status === 'pending') {
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-bg text-warning border border-warning/20"
        title="طلب التوثيق قيد المراجعة"
      >
        <svg class="w-3.5 h-3.5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>قيد التحقق</span>
      </span>
    }
  `
})
export class VerificationBadgeComponent {
  @Input() status: OrganizationVerificationStatus = 'unverified';
}

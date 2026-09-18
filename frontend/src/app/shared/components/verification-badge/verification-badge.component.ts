import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationVerificationStatus } from '../../../core/models/organization.model';

@Component({
  selector: 'app-verification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (status === 'verified' || status === 'approved') {
      <span
        class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success text-white shrink-0 shadow-2xs"
        title="منظمة موثقة ومتحقق منها رسمياً"
        role="img"
        aria-label="منظمة موثقة (Verified organization)"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    } @else if (status === 'pending' && isDashboardContext) {
      <!-- Pending is shown ONLY in the organization's own authorized dashboard per DESIGN.md §13 & §25 -->
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-bg text-warning border border-warning/20 shadow-2xs"
        title="طلب التوثيق قيد المراجعة الفنية"
        role="status"
        aria-label="طلب التوثيق قيد المراجعة الفنية"
      >
        <svg class="w-3 h-3 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-[10px]">قيد المراجعة</span>
      </span>
    }
    <!-- Rejected or unverified organizations display NO badge at all per DESIGN.md §13 & §25 rule -->
  `
})
export class VerificationBadgeComponent {
  /**
   * Verification status of the organization ('verified' | 'approved' | 'pending' | 'rejected' | 'unverified').
   */
  @Input() status: OrganizationVerificationStatus | 'approved' | string = 'unverified';

  /**
   * Context of the badge.
   * If false (public view, default), private 'pending' status is never shown.
   * Only the organization's own private dashboard may set this to true.
   */
  @Input() isDashboardContext = false;
}

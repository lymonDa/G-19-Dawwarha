import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contribution } from '../../../core/models/contribution.model';
import { VerificationBadgeComponent } from '../verification-badge/verification-badge.component';
import { SkeletonComponent } from '../../ui/skeleton/skeleton.component';

@Component({
  selector: 'app-contribution-card',
  standalone: true,
  imports: [CommonModule, VerificationBadgeComponent, SkeletonComponent],
  template: `
    @if (isLoading) {
      <li class="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 list-none">
        <div class="flex items-center gap-3 flex-1">
          <app-skeleton variant="circular" width="40px" height="40px"></app-skeleton>
          <div class="space-y-1.5 flex-1">
            <app-skeleton variant="text" width="180px" height="16px"></app-skeleton>
            <app-skeleton variant="text" width="120px" height="12px"></app-skeleton>
          </div>
        </div>
        <app-skeleton variant="rectangular" width="90px" height="24px"></app-skeleton>
      </li>
    } @else if (contribution) {
      <li
        class="p-4 rounded-xl border border-neutral-200 bg-white hover:border-primary-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 list-none"
        [attr.aria-label]="accessibleLabel"
      >
        <!-- Title & Category Info -->
        <div class="flex items-start sm:items-center gap-3">
          <!-- Category / Transfer Icon -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            [ngClass]="role === 'provider' ? 'bg-primary-50 text-primary' : 'bg-sand-500/10 text-sand-700'"
            aria-hidden="true"
          >
            @if (role === 'provider') {
              <!-- Outgoing / Provider icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            } @else {
              <!-- Incoming / Seeker icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            }
          </div>

          <!-- Titles & Counterpart -->
          <div>
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                [ngClass]="role === 'provider' ? 'bg-primary-100 text-primary-800' : 'bg-sand-100 text-sand-800'"
              >
                {{ role === 'provider' ? 'أنت قدمت (مانح)' : 'أنت استلمت (مستفيد)' }}
              </span>
              @if (contribution.quantity > 1) {
                <span class="text-xs text-neutral-500 font-medium">
                  الكمية: {{ contribution.quantity }}
                </span>
              }
            </div>

            <h4 class="text-sm font-bold text-neutral-900 mt-1">
              {{ contribution.resourceTitle || contribution.category || 'مورد حضري معاد توجيهه' }}
            </h4>

            <div class="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-600">
              <span>الطرف المقابل:</span>
              <span class="font-medium text-neutral-800">
                {{ contribution.counterpartName || (role === 'provider' ? 'جهة مستفيدة' : 'جهة مانحة') }}
              </span>
              @if (contribution.counterpartVerified) {
                <app-verification-badge [status]="'verified'"></app-verification-badge>
              }
              <!-- PRIVACY GUARANTEE: Contact information (phone, email, links) is NEVER rendered here per DESIGN.md §13 -->
            </div>
          </div>
        </div>

        <!-- Completion Date & Badge -->
        <div class="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
          <span class="inline-flex items-center gap-1 text-[11px] font-medium text-success">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>مكتملة وموثقة</span>
          </span>

          <span class="text-[11px] font-mono text-neutral-400 mt-0.5">
            {{ (contribution.recordedAt || contribution.createdAt) | date:'mediumDate' }}
          </span>
        </div>
      </li>
    }
  `
})
export class ContributionCardComponent {
  @Input() contribution?: Contribution;
  @Input() role: 'provider' | 'seeker' = 'provider';
  @Input() isLoading = false;

  get accessibleLabel(): string {
    if (!this.contribution) return 'مساهمة مكتملة';
    const roleText = this.role === 'provider' ? 'أنت قدمت' : 'أنت استلمت';
    const title = this.contribution.resourceTitle || this.contribution.category || 'مورد';
    const counterpart = this.contribution.counterpartName || 'الطرف الآخر';
    const date = this.contribution.recordedAt || this.contribution.createdAt;
    return `${roleText} ${title} بالتعاون مع ${counterpart} في تاريخ ${date}`;
  }
}

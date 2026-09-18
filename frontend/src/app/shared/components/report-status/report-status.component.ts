import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportStatus } from '../../../core/models/report.model';
import { BadgeComponent } from '../../ui/badge/badge.component';

@Component({
  selector: 'app-report-status',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <div
      class="flex items-center gap-2"
      [attr.aria-label]="accessibleLabel"
      role="status"
    >
      <!-- Status Badge -->
      <app-badge [variant]="badgeVariant" [size]="size">
        <span class="flex items-center gap-1 font-medium">
          @if (status === 'resolved') {
            <svg class="w-3 h-3 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          } @else if (status === 'reviewed') {
            <svg class="w-3 h-3 text-info shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          } @else {
            <svg class="w-3 h-3 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          <span>{{ statusLabel }}</span>
        </span>
      </app-badge>

      <!-- Optional Timestamp Trails -->
      @if (timestamp) {
        <span class="text-[11px] text-neutral-400 font-mono">
          {{ timestamp | date:'shortDate' }}
        </span>
      }

      <!-- Reporter-facing Reassurance Copy -->
      @if (isReporterFacing) {
        <span class="text-xs text-neutral-500 ms-1">
          {{ reassuranceText }}
        </span>
      }
    </div>
  `
})
export class ReportStatusComponent {
  @Input() status: ReportStatus = 'open';
  @Input() timestamp?: string | Date;
  @Input() size: 'sm' | 'md' = 'sm';
  @Input() isReporterFacing = false;

  get badgeVariant(): 'warning' | 'info' | 'success' | 'neutral' {
    switch (this.status) {
      case 'resolved':
        return 'success';
      case 'reviewed':
        return 'info';
      case 'open':
      default:
        return 'warning';
    }
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'resolved':
        return 'تمت المعالجة';
      case 'reviewed':
        return 'قيد الفحص';
      case 'open':
      default:
        return 'مفتوح للمراجعة';
    }
  }

  get reassuranceText(): string {
    switch (this.status) {
      case 'resolved':
        return 'تمت معالجة البلاغ واتخاذ الإجراءات اللازمة لضمان سلامة المنصة.';
      case 'reviewed':
        return 'يقوم فريق الإشراف بفحص تفاصيل البلاغ حالياً.';
      case 'open':
      default:
        return 'تم استلام بلاغك وهو في قائمة انتظار المراجعة الإدارية.';
    }
  }

  get accessibleLabel(): string {
    return `حالة البلاغ: ${this.statusLabel}`;
  }
}

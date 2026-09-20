import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Match } from '../../../core/models/match.model';
import { Request } from '../../../core/models/request.model';
import { Resource } from '../../../core/models/resource.model';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService, injectLanguageService } from '../../../core/services/language.service';
import { MatchScoreComponent } from '../match-score/match-score.component';
import { RequestCardComponent } from '../request-card/request-card.component';
import { DialogComponent } from '../../ui/dialog/dialog.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatchScoreComponent,
    RequestCardComponent,
    DialogComponent,
    ButtonComponent
  ],
  template: `
    <div class="relative overflow-hidden rounded-card border border-neutral-200 bg-neutral-0 p-5 shadow-sm transition-shadow hover:shadow-md">
      <!-- 1. Top MatchScore Component (Flagship - Always Visible) -->
      <app-match-score
        [score]="match.score"
        [breakdown]="match.scoreBreakdown"
      />

      <!-- 2 & 3. Comparison Section: Compact ResourceCard & Compact RequestCard -->
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <!-- Compact Resource Column -->
        <div class="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
          <div class="flex items-center justify-between border-b border-neutral-200/60 pb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {{ isArabic ? 'مورد معروض' : 'Supplied Resource' }}
            </span>
            <span class="rounded-md bg-neutral-200/60 px-2 py-0.5 text-xs font-semibold text-neutral-700">
              {{ isArabic ? 'الكمية' : 'Qty' }}: {{ resourceQuantity }}
            </span>
          </div>

          <div class="mt-2.5">
            <h4 class="font-semibold text-neutral-900">
              {{ resourceTitle }}
            </h4>
            <p class="mt-0.5 text-xs text-neutral-500">
              {{ isArabic ? 'التصنيف' : 'Category' }}: <span class="font-medium text-neutral-700">{{ resourceCategory }}</span>
            </p>
            <p class="mt-1 flex items-center gap-1 text-xs text-neutral-600">
              <svg class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ resourceLocation }}</span>
            </p>
          </div>
        </div>

        <!-- Compact RequestCard -->
        <app-request-card
          variant="compact"
          [request]="requestObject"
        />
      </div>

      <!-- 4. Actions Bar -->
      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <div>
          @if (match.status && match.status !== 'proposed') {
            <span
              class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide capitalize"
              [ngClass]="statusBadgeClass"
            >
              {{ isArabic ? 'الحالة' : 'Status' }}: {{ statusLabel }}
            </span>
          } @else {
            <span class="inline-flex items-center gap-1 rounded-full border border-info/20 bg-info-bg px-2.5 py-0.5 text-xs font-medium text-info">
              {{ isArabic ? 'مطابقة مقترحة' : 'Proposed Match' }}
            </span>
          }
        </div>

        <div class="flex flex-wrap items-center gap-2">
          @if (match.status === 'proposed' && isAuthorizedParty) {
            <app-button
              variant="primary"
              size="sm"
              [isLoading]="loading"
              (clicked)="triggerAccept()"
            >
              {{ isArabic ? 'قبول المطابقة' : 'Accept Match' }}
            </app-button>

            <app-button
              variant="danger"
              size="sm"
              [disabled]="loading"
              (clicked)="triggerReject()"
            >
              {{ isArabic ? 'رفض' : 'Reject' }}
            </app-button>
          }

          @if (match.status === 'accepted' && matchId) {
            <a
              [routerLink]="['/handovers', matchId]"
              class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-xs"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ isArabic ? 'تأكيد التسليم' : 'Confirm Handover' }}</span>
            </a>
          }

          @if (showDetailsLink && matchId) {
            <a
              [routerLink]="['/matches', matchId]"
              class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-0 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              <span>{{ isArabic ? 'عرض التفاصيل' : 'View Details' }}</span>
              <svg class="h-3.5 w-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          }
        </div>
      </div>

      <!-- Confirmation Dialogs via Shared app-dialog -->
      <app-dialog
        [isOpen]="showAcceptConfirm"
        [title]="isArabic ? 'تأكيد قبول المطابقة' : 'Confirm Match Acceptance'"
        [confirmText]="isArabic ? 'تأكيد وقبول' : 'Confirm & Accept'"
        [cancelText]="isArabic ? 'إلغاء' : 'Cancel'"
        confirmVariant="primary"
        [isLoading]="loading"
        (close)="cancelAccept()"
        (confirm)="confirmAccept()"
      >
        <p>
          {{ isArabic ? 'قبول هذه المطابقة سيبدأ إجراءات تسليم المورد وتنسيق التواصل بين الطرفين. هل تريد المتابعة؟' : 'Accepting this match will initiate the handover coordination workflow between provider and requester. Do you want to proceed?' }}
        </p>
      </app-dialog>

      <app-dialog
        [isOpen]="showRejectConfirm"
        [title]="isArabic ? 'رفض هذه المطابقة؟' : 'Reject This Match?'"
        [confirmText]="isArabic ? 'تأكيد الرفض' : 'Confirm Reject'"
        [cancelText]="isArabic ? 'إلغاء' : 'Cancel'"
        confirmVariant="danger"
        [isLoading]="loading"
        (close)="cancelReject()"
        (confirm)="confirmReject()"
      >
        <p>
          {{ isArabic ? 'هل أنت متأكد من رغبتك في رفض هذه المطابقة؟ سيظل المورد متاحاً لطلبات ومطابقات أخرى.' : 'Are you sure you want to decline this candidate match? The resource will remain available for other matching requests.' }}
        </p>
      </app-dialog>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MatchCardComponent {
  private auth = inject(AuthService);
  languageService = injectLanguageService();

  get isArabic(): boolean {
    return this.languageService?.currentLanguage() === 'ar';
  }

  get statusLabel(): string {
    return this.languageService?.getStatusLabel(this.match?.status) || this.match?.status || '';
  }

  @Input({ required: true }) match!: Match;
  @Input() loading = false;
  @Input() showDetailsLink = true;

  @Output() accept = new EventEmitter<Match>();
  @Output() reject = new EventEmitter<Match>();

  showAcceptConfirm = false;
  showRejectConfirm = false;

  get matchId(): string {
    return this.match?._id || this.match?.id || '';
  }

  get resourceTitle(): string {
    if (typeof this.match?.resourceId === 'object' && this.match.resourceId) {
      return this.match.resourceId.title;
    }
    return 'Resource';
  }

  get resourceCategory(): string {
    if (this.languageService && typeof this.match?.resourceId === 'object' && this.match.resourceId) {
      const res = this.match.resourceId as Resource;
      const cat = res.category || res.categoryId;
      const label = this.languageService.getCategoryLabel(cat);
      if (label && label !== '[object Object]') return label;
    }
    if (typeof this.match?.resourceId === 'object' && this.match.resourceId) {
      const res = this.match.resourceId as Resource;
      if (res.category?.name) return res.category.name;
      if (res.categoryId) return res.categoryId;
    }
    return this.isArabic ? 'التصنيف' : 'Category';
  }

  get resourceQuantity(): number {
    if (typeof this.match?.resourceId === 'object' && this.match.resourceId) {
      return this.match.resourceId.quantity;
    }
    return 1;
  }

  get resourceLocation(): string {
    if (typeof this.match?.resourceId === 'object' && this.match.resourceId) {
      const loc = this.match.resourceId.location;
      if (!loc) return this.isArabic ? 'الموقع غير محدد' : 'Location not specified';
      return loc.city + (loc.area ? ` · ${loc.area}` : '');
    }
    return this.isArabic ? 'الموقع غير محدد' : 'Location not specified';
  }

  get requestObject(): Request {
    if (this.match?.requestId && typeof this.match.requestId === 'object') {
      return this.match.requestId as Request;
    }
    return {
      _id: typeof this.match?.requestId === 'string' ? this.match.requestId : '',
      id: typeof this.match?.requestId === 'string' ? this.match.requestId : '',
      requesterId: typeof this.match?.requesterId === 'string' ? this.match.requesterId : (this.match?.requesterId?._id || ''),
      categoryId: 'Demand Request',
      quantity: 1,
      urgency: 'medium',
      location: { city: 'Location not specified' },
      status: 'matched'
    } as Request;
  }

  get isAuthorizedParty(): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;

    const currentUserId = user._id || user.id;
    if (!currentUserId) return false;

    const provId = typeof this.match?.providerId === 'object'
      ? (this.match.providerId?._id || this.match.providerId?.id)
      : this.match?.providerId;
    const reqId = typeof this.match?.requesterId === 'object'
      ? (this.match.requesterId?._id || this.match.requesterId?.id)
      : this.match?.requesterId;
    const resProvId = typeof this.match?.resourceId === 'object'
      ? this.match.resourceId?.providerId
      : undefined;
    const reqReqId = typeof this.match?.requestId === 'object'
      ? this.match.requestId?.requesterId
      : undefined;

    return currentUserId === provId || currentUserId === reqId || currentUserId === resProvId || currentUserId === reqReqId;
  }

  get statusBadgeClass(): string {
    switch (this.match?.status) {
      case 'accepted':
        return 'bg-primary-100 text-primary-800 border-primary-500/30';
      case 'rejected':
        return 'bg-danger-bg text-danger border-danger/30';
      case 'expired':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      case 'proposed':
      default:
        return 'bg-info-bg text-info border-info/30';
    }
  }

  triggerAccept(): void {
    this.showAcceptConfirm = true;
  }

  confirmAccept(): void {
    this.showAcceptConfirm = false;
    this.accept.emit(this.match);
  }

  cancelAccept(): void {
    this.showAcceptConfirm = false;
  }

  triggerReject(): void {
    this.showRejectConfirm = true;
  }

  confirmReject(): void {
    this.showRejectConfirm = false;
    this.reject.emit(this.match);
  }

  cancelReject(): void {
    this.showRejectConfirm = false;
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatchApiService } from '../services/match-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Match } from '../../../core/models/match.model';
import { Resource } from '../../../core/models/resource.model';
import { Request } from '../../../core/models/request.model';
import { MatchScoreComponent } from '../../../shared/components/match-score/match-score.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatchScoreComponent,
    SkeletonComponent,
    DialogComponent,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <!-- Breadcrumb -->
        <a
          routerLink="/matches"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{{ isRtl ? 'العودة إلى المطابقات' : 'Back to Matches' }}</span>
        </a>

        <!-- Alerts -->
        @if (successMessage) {
          <div class="mt-4 rounded-card border border-success/30 bg-success-bg p-4 text-sm text-success" role="status">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ successMessage }}</span>
            </div>
            @if (match?.status === 'accepted') {
              <div class="mt-3 flex items-center gap-3">
                <a
                  [routerLink]="['/handovers', matchId]"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
                >
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>{{ isRtl ? 'الانتقال إلى تأكيد التسليم والاستلام' : 'Proceed to Handover Confirmation' }}</span>
                </a>
              </div>
            }
          </div>
        }

        @if (errorMessage) {
          <div class="mt-4 rounded-card border border-danger/30 bg-danger-bg p-4 text-sm text-danger" role="alert">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </div>
        }

        <!-- Content -->
        @if (loading) {
          <div class="mt-6 space-y-4">
            <app-skeleton variant="card" height="120px" />
            <app-skeleton variant="card" height="260px" />
          </div>
        } @else if (match) {
          <div class="mt-6 overflow-hidden rounded-card border border-neutral-200 bg-neutral-0 p-6 shadow-sm sm:p-8">
            <!-- Title & Status Header -->
            <div class="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span class="rounded bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                  {{ isRtl ? 'مطابقة #' : 'Match #' }}{{ matchId.slice(-6) }}
                </span>
                <h1 class="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  {{ isRtl ? 'مقارنة وتقييم المطابقة الذكية' : 'Match Comparison & Evaluation' }}
                </h1>
                <p class="mt-1 text-sm text-neutral-500">
                  {{ isRtl ? 'تاريخ التوليد:' : 'Generated on' }} {{ formatDate(match.createdAt) }}
                </p>
              </div>

              <div>
                <span
                  class="inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider"
                  [ngClass]="match.status === 'accepted' ? 'bg-primary-100 text-primary-800 border-primary-500/30' : (match.status === 'rejected' ? 'bg-danger-bg text-danger border-danger/30' : 'bg-info-bg text-info border-info/30')"
                >
                  {{ isRtl ? 'الحالة:' : 'Status:' }} {{ getStatusLabel(match.status) }}
                </span>
              </div>
            </div>

            <!-- Flagship MatchScore Visualization -->
            <div class="mt-6">
              <app-match-score
                [score]="match.score"
                [breakdown]="match.scoreBreakdown"
              />
            </div>

            <!-- Deep Comparison Grid (Resource vs Request) -->
            <div class="mt-6 grid gap-6 md:grid-cols-2">
              <!-- Resource Side -->
              <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5">
                <div class="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-primary-700">
                    {{ isRtl ? 'المورد المتاح (المعروض)' : 'Supplied Resource' }}
                  </span>
                  <span class="rounded bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
                    {{ isRtl ? 'الكمية:' : 'Qty:' }} {{ resourceQuantity }}
                  </span>
                </div>

                <div class="mt-4 space-y-3">
                  <div>
                    <span class="text-xs text-neutral-500">{{ isRtl ? 'عنوان المورد' : 'Resource Title' }}</span>
                    <p class="font-bold text-neutral-900 text-lg">{{ resourceTitle }}</p>
                  </div>

                  <div>
                    <span class="text-xs text-neutral-500">{{ isRtl ? 'التصنيف' : 'Category' }}</span>
                    <p class="font-medium text-neutral-800">{{ resourceCategory }}</p>
                  </div>

                  <div>
                    <span class="text-xs text-neutral-500">{{ isRtl ? 'الموقع الجغرافي' : 'Location' }}</span>
                    <p class="font-medium text-neutral-800">{{ resourceLocation }}</p>
                  </div>

                  @if (resource?.description) {
                    <div>
                      <span class="text-xs text-neutral-500">{{ isRtl ? 'الوصف والتفاصيل' : 'Description' }}</span>
                      <p class="text-xs text-neutral-700">{{ resource?.description }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Request Side -->
              <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5">
                <div class="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-primary-700">
                    {{ isRtl ? 'الطلب المستهدف (الاحتياج)' : 'Target Request' }}
                  </span>
                  <span class="rounded bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
                    {{ isRtl ? 'الكمية:' : 'Qty:' }} {{ requestQuantity }}
                  </span>
                </div>

                <div class="mt-4 space-y-3">
                  <div>
                    <span class="text-xs text-neutral-500">{{ isRtl ? 'التصنيف المطلوب' : 'Requested Category' }}</span>
                    <p class="font-bold text-neutral-900 text-lg">{{ requestCategory }}</p>
                  </div>

                  <div>
                    <span class="text-xs text-neutral-500">{{ isRtl ? 'درجة الإلحاح' : 'Urgency Level' }}</span>
                    <p class="font-medium capitalize text-neutral-800">{{ getUrgencyLabel(requestUrgency) }}</p>
                  </div>

                  <div>
                    <span class="text-xs text-neutral-500">{{ isRtl ? 'الموقع المطلوب' : 'Requested Location' }}</span>
                    <p class="font-medium text-neutral-800">{{ requestLocation }}</p>
                  </div>

                  @if (request?.description) {
                    <div>
                      <span class="text-xs text-neutral-500">{{ isRtl ? 'الوصف والتفاصيل' : 'Description' }}</span>
                      <p class="text-xs text-neutral-700">{{ request?.description }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Action Buttons for Proposed Match (Only visible to Authorized Parties) -->
            @if (match.status === 'proposed' && isAuthorizedParty) {
              <div class="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-neutral-100 pt-6">
                <app-button
                  variant="outline"
                  (clicked)="promptReject()"
                  [disabled]="processing"
                >
                  {{ isRtl ? 'رفض المطابقة' : 'Reject Match' }}
                </app-button>

                <app-button
                  variant="primary"
                  (clicked)="promptAccept()"
                  [isLoading]="processing"
                  [disabled]="processing"
                >
                  {{ isRtl ? 'قبول المطابقة' : 'Accept Match' }}
                </app-button>
              </div>
            }

            @if (match.status === 'accepted') {
              <div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-6">
                <div class="flex items-center gap-2 text-sm text-neutral-600">
                  <svg class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ isRtl ? 'تم قبول المطابقة — جاري التنسيق للتسليم.' : 'Match accepted — handover coordination is in progress.' }}</span>
                </div>
                <a
                  [routerLink]="['/handovers', matchId]"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition-colors"
                >
                  <span>{{ isRtl ? 'الانتقال إلى التسليم' : 'Go to Handover' }}</span>
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Confirmation Dialogs using shared App Dialog -->
    <app-dialog
      [isOpen]="showAcceptConfirm"
      [title]="isRtl ? 'قبول المطابقة المقترحة؟' : 'Accept Candidate Match?'"
      [description]="isRtl ? 'الموافقة ستثبت هذه المطابقة وتبدأ إجراءات التنسيق للتسليم والاستلام بين الطرفين.' : 'Accepting will lock this match and initiate downstream handover coordination.'"
      [confirmText]="isRtl ? 'تأكيد وقبول' : 'Confirm & Accept'"
      [cancelText]="isRtl ? 'إلغاء' : 'Cancel'"
      confirmVariant="primary"
      (confirm)="confirmAccept()"
      (cancel)="showAcceptConfirm = false"
    />

    <app-dialog
      [isOpen]="showRejectConfirm"
      [title]="isRtl ? 'رفض هذه المطابقة؟' : 'Reject This Match?'"
      [description]="isRtl ? 'هل أنت متأكد من رفض هذه المطابقة؟ سيبقى المورد متاحاً لاحتياجات ومطابقات أخرى.' : 'Are you sure you want to decline this match? The resource will remain open for other potential requests.'"
      [confirmText]="isRtl ? 'تأكيد الرفض' : 'Confirm Reject'"
      [cancelText]="isRtl ? 'إلغاء' : 'Cancel'"
      confirmVariant="danger"
      (confirm)="confirmReject()"
      (cancel)="showRejectConfirm = false"
    />
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MatchDetailComponent implements OnInit {
  protected languageService = injectLanguageService();

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  match: Match | null = null;
  matchId = '';
  loading = true;
  processing = false;

  successMessage = '';
  errorMessage = '';

  showAcceptConfirm = false;
  showRejectConfirm = false;

  private route = inject(ActivatedRoute);
  private api = inject(MatchApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  getStatusLabel(status?: string): string {
    if (!status) return '';
    return this.languageService?.getStatusLabel(status) || status;
  }

  getUrgencyLabel(urgency?: string): string {
    if (!urgency) return '';
    return this.languageService?.getUrgencyLabel(urgency) || urgency;
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    const locale = this.isRtl ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id') || '';
    if (this.matchId) {
      this.loadMatch();
    } else {
      this.errorMessage = this.isRtl ? 'معرف المطابقة غير متوفر.' : 'No Match ID provided.';
      this.loading = false;
    }
  }

  loadMatch(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getById(this.matchId).subscribe({
      next: (data) => {
        this.match = data;
        this.loading = false;
        if (!data) {
          this.errorMessage = this.isRtl ? 'لم يتم العثور على المطابقة أو انتهت صلاحيتها.' : 'Match not found or expired.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل تحميل تفاصيل المطابقة.' : 'Failed to load match details.');
      }
    });
  }

  get isAuthorizedParty(): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;

    const currentUserId = String(user._id || user.id || '');
    if (!currentUserId) return false;

    const res = this.match?.resourceId as any;
    const providerId = String(
      typeof res?.providerId === 'object'
        ? res?.providerId?._id || res?.providerId?.id
        : res?.providerId || ''
    );

    const req = this.match?.requestId as any;
    const requesterId = String(
      typeof req?.requesterId === 'object'
        ? req?.requesterId?._id || req?.requesterId?.id
        : req?.requesterId || ''
    );

    return currentUserId === providerId || currentUserId === requesterId;
  }

  promptAccept(): void {
    this.showAcceptConfirm = true;
  }

  confirmAccept(): void {
    this.showAcceptConfirm = false;
    this.processing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.accept(this.matchId).subscribe({
      next: () => {
        this.processing = false;
        if (this.match) {
          this.match = { ...this.match, status: 'accepted' };
        }
        this.successMessage = this.isRtl
          ? 'تم قبول المطابقة بنجاح! تم إنشاء تنسيق التسليم والاستلام.'
          : 'Match accepted! Handover coordination has been successfully generated.';
        this.toast.show({
          variant: 'success',
          message: this.successMessage
        });
      },
      error: (err: any) => {
        this.processing = false;
        if (err?.status === 409) {
          this.errorMessage = this.isRtl
            ? 'تعارض: هذه المطابقة أو المورد المرتبط بها لم يعد متاحاً.'
            : 'Conflict: this match or associated resource is no longer available.';
        } else if (err?.status === 403) {
          this.errorMessage = this.isRtl
            ? 'ليس لديك الصلاحية لقبول هذه المطابقة.'
            : 'You do not have permission to accept this match.';
        } else {
          this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل قبول المطابقة.' : 'Failed to accept match.');
        }
        this.toast.show({
          variant: 'error',
          message: this.errorMessage
        });
      }
    });
  }

  promptReject(): void {
    this.showRejectConfirm = true;
  }

  confirmReject(): void {
    this.showRejectConfirm = false;
    this.processing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.reject(this.matchId).subscribe({
      next: () => {
        this.processing = false;
        if (this.match) {
          this.match = { ...this.match, status: 'rejected' };
        }
        this.successMessage = this.isRtl
          ? 'تم رفض المطابقة. تمت إعادة المورد إلى الحالة المتاحة.'
          : 'Match rejected. The resource has been returned to available status.';
        this.toast.show({
          variant: 'info',
          message: this.successMessage
        });
      },
      error: (err: any) => {
        this.processing = false;
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل رفض المطابقة.' : 'Failed to reject match.');
        this.toast.show({
          variant: 'error',
          message: this.errorMessage
        });
      }
    });
  }

  get resource(): Resource | null {
    if (!this.match || typeof this.match.resourceId === 'string') return null;
    return this.match.resourceId as Resource;
  }

  get request(): Request | null {
    if (!this.match || typeof this.match.requestId === 'string') return null;
    return this.match.requestId as Request;
  }

  get resourceTitle(): string {
    return this.resource?.title || (this.isRtl ? 'مورد' : 'Resource');
  }

  get resourceCategory(): string {
    const cat = this.resource?.category || (this.resource as any)?.categoryId;
    return typeof cat === 'object' && cat?.name ? cat.name : (this.isRtl ? 'تصنيف' : 'Category');
  }

  get resourceQuantity(): number {
    return this.resource?.quantity || 1;
  }

  get resourceLocation(): string {
    const loc = this.resource?.location;
    if (!loc) return this.isRtl ? 'الموقع غير محدد' : 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
  }

  get requestCategory(): string {
    const cat = (this.request as any)?.category || this.request?.categoryId;
    return typeof cat === 'object' && cat?.name ? cat.name : (this.isRtl ? 'تصنيف' : 'Category');
  }

  get requestQuantity(): number {
    return this.request?.quantity || 1;
  }

  get requestUrgency(): string {
    return this.request?.urgency || 'medium';
  }

  get requestLocation(): string {
    const loc = this.request?.location;
    if (!loc) return this.isRtl ? 'الموقع غير محدد' : 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
  }
}
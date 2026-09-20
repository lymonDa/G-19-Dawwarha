import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { Request } from '../../../core/models/request.model';
import { ToastService } from '../../../core/services/toast.service';
import { UrgencyBadgeComponent } from '../../../shared/components/urgency-badge/urgency-badge.component';
import { LifecycleTimelineComponent, LifecycleStepId } from '../../../shared/components/lifecycle-timeline/lifecycle-timeline.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    UrgencyBadgeComponent,
    LifecycleTimelineComponent,
    DialogComponent,
    SkeletonComponent,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <!-- Breadcrumbs / Back Link -->
        <a
          routerLink="/requests"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{{ isRtl ? 'العودة إلى الطلبات' : 'Back to Requests' }}</span>
        </a>

        <!-- Error Alert -->
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

        <!-- Loading Skeleton via Shared app-skeleton -->
        @if (loading) {
          <div class="mt-6 space-y-4">
            <app-skeleton variant="card" height="120px" />
            <app-skeleton variant="card" height="260px" />
          </div>
        } @else if (request) {
          <!-- Main Content Card -->
          <div class="mt-6 overflow-hidden rounded-card border border-neutral-200 bg-neutral-0 p-6 shadow-sm sm:p-8">
            <!-- Header Row -->
            <div class="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="rounded bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                    {{ isRtl ? 'طلب احتياج #' : 'Demand Request #' }}{{ requestId.slice(-6) }}
                  </span>
                  <app-urgency-badge [urgency]="request.urgency" />
                </div>

                <h1 class="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  {{ categoryName }}
                </h1>
                <p class="mt-1 text-sm text-neutral-500">
                  {{ isRtl ? 'تاريخ النشر:' : 'Posted on' }} {{ formatDate(request.createdAt) }}
                </p>
              </div>

              <!-- Status Badge -->
              <div>
                <span
                  class="inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider"
                  [ngClass]="statusBadgeClass"
                >
                  {{ isRtl ? 'الحالة:' : 'Status:' }} {{ getStatusLabel(request.status) }}
                </span>
              </div>
            </div>

            <!-- Integrated Lifecycle Timeline (Product & Backend Contract Aligned) -->
            <div class="mt-6 border-b border-neutral-100 pb-6">
              <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {{ isRtl ? 'مسار ومراحل دورة حياة الطلب' : 'Request Lifecycle Progress' }}
              </h2>
              <app-lifecycle-timeline
                [currentStep]="currentLifecycleStep"
                [terminalState]="timelineTerminalState"
                [cancelledAtStep]="currentLifecycleStep"
              />
            </div>

            <!-- Specifications Grid -->
            <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <span class="text-xs font-semibold uppercase text-neutral-500">{{ isRtl ? 'الكمية المطلوبة' : 'Quantity Needed' }}</span>
                <p class="mt-1 text-xl font-bold text-neutral-900">{{ request.quantity }} {{ isRtl ? 'وحدة' : 'units' }}</p>
              </div>

              <div class="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <span class="text-xs font-semibold uppercase text-neutral-500">{{ isRtl ? 'درجة الإلحاح' : 'Urgency' }}</span>
                <p class="mt-1 text-xl font-bold capitalize text-neutral-900">{{ getUrgencyLabel(request.urgency) }}</p>
              </div>

              <div class="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <span class="text-xs font-semibold uppercase text-neutral-500">{{ isRtl ? 'المدينة / المحافظة' : 'City / Region' }}</span>
                <p class="mt-1 text-xl font-bold text-neutral-900">{{ request.location.city }}</p>
              </div>

              <div class="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <span class="text-xs font-semibold uppercase text-neutral-500">{{ isRtl ? 'المنطقة / الحي' : 'Area' }}</span>
                <p class="mt-1 text-xl font-bold text-neutral-900">{{ request.location.area || (isRtl ? 'المنطقة العامة' : 'General Area') }}</p>
              </div>
            </div>

            <!-- Description Section -->
            <div class="mt-6 rounded-xl border border-neutral-100 bg-neutral-50 p-5">
              <h3 class="text-sm font-semibold text-neutral-900">{{ isRtl ? 'تفاصيل ووصف الاحتياج' : 'Request Description' }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
                {{ request.description || (isRtl ? 'لم يقم صاحب الطلب بإضافة تفاصيل إضافية.' : 'No additional description provided by the requester.') }}
              </p>
            </div>

            <!-- Lifecycle Actions Bar -->
            <div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-6">
              <div class="flex flex-wrap items-center gap-2">
                <!-- Edit Button (Available for draft or published) -->
                @if (request.status === 'draft' || request.status === 'published') {
                  <a
                    [routerLink]="['/requests', requestId, 'edit']"
                    class="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {{ isRtl ? 'تعديل الطلب' : 'Edit Request' }}
                  </a>
                }

                <!-- Publish Button (For draft requests) -->
                @if (request.status === 'draft') {
                  <app-button
                    variant="primary"
                    [isLoading]="actionProcessing"
                    (clicked)="publishRequest()"
                  >
                    {{ isRtl ? 'نشر الطلب' : 'Publish Request' }}
                  </app-button>
                }

                <!-- View Matches Link -->
                @if (request.status === 'published' || request.status === 'matched') {
                  <a
                    routerLink="/matches"
                    class="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{{ isRtl ? 'استعراض المطابقات المتاحة' : 'Check Available Matches' }}</span>
                  </a>
                }
              </div>

              <!-- Cancel Request Button -->
              @if (request.status === 'published' || request.status === 'matched' || request.status === 'draft') {
                <app-button
                  variant="danger"
                  [disabled]="actionProcessing"
                  (clicked)="promptCancel()"
                >
                  {{ isRtl ? 'إلغاء الطلب' : 'Cancel Request' }}
                </app-button>
              }
            </div>
          </div>
        }

        <!-- Cancellation Dialog via Shared app-dialog -->
        <app-dialog
          [isOpen]="showCancelConfirm"
          [title]="isRtl ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Cancel This Request?'"
          [confirmText]="isRtl ? 'تأكيد الإلغاء' : 'Confirm Cancellation'"
          [cancelText]="isRtl ? 'إبقاء الطلب نشطاً' : 'Keep Active'"
          confirmVariant="danger"
          [isLoading]="actionProcessing"
          (close)="dismissCancel()"
          (confirm)="confirmCancel()"
        >
          <p>
            {{ isRtl
              ? 'سيؤدي إلغاء هذا الطلب إلى إزالته من نظام المطابقة التلقائية. يمكنك دائماً تسجيل طلب جديد في أي وقت.'
              : 'Cancelling this demand request will remove it from active matching discovery. You can create a new request at any time.' }}
          </p>
        </app-dialog>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RequestDetailComponent implements OnInit {
  protected languageService = injectLanguageService();

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  request: Request | null = null;
  requestId = '';
  loading = true;
  actionProcessing = false;
  errorMessage = '';

  showCancelConfirm = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(RequestApiService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    if (this.requestId) {
      this.loadRequest();
    } else {
      this.errorMessage = this.isRtl ? 'معرف الطلب غير متوفر.' : 'No request ID provided.';
      this.loading = false;
    }
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    const locale = this.isRtl ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getStatusLabel(status?: string): string {
    if (!status) return '';
    return this.languageService?.getStatusLabel(status) || status;
  }

  getUrgencyLabel(urgency?: string): string {
    if (!urgency) return '';
    return this.languageService?.getUrgencyLabel(urgency) || urgency;
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
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل تحميل تفاصيل الطلب.' : 'Failed to load request details.');
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
    return this.isRtl ? 'طلب احتياج' : 'Demand Request';
  }

  get currentLifecycleStep(): LifecycleStepId {
    switch (this.request?.status) {
      case 'draft':
        return 'draft';
      case 'published':
        return 'published';
      case 'matched':
        return 'matched';
      case 'accepted':
        return 'accepted';
      case 'fulfilled':
        return 'completed';
      default:
        return 'draft';
    }
  }

  get timelineTerminalState(): 'none' | 'cancelled' | 'failed' {
    if (this.request?.status === 'cancelled') return 'cancelled';
    if (this.request?.status === 'expired') return 'failed';
    return 'none';
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
        this.toast.success(
          this.isRtl
            ? 'تم نشر الطلب بنجاح وهو الآن متاح للمطابقة الذكية.'
            : 'Request published successfully and is now discoverable for matching.'
        );
      },
      error: (err) => {
        this.actionProcessing = false;
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل نشر الطلب.' : 'Failed to publish request.');
        this.toast.error(this.errorMessage);
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
        this.toast.success(this.isRtl ? 'تم إلغاء الطلب بنجاح.' : 'Request has been cancelled.');
      },
      error: (err) => {
        this.actionProcessing = false;
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل إلغاء الطلب.' : 'Failed to cancel request.');
        this.toast.error(this.errorMessage);
      }
    });
  }
}

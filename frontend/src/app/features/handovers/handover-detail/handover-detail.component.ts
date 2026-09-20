import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import {
  LifecycleTimelineComponent,
  LifecycleStepId,
  HandoverConfirmationState
} from '../../../shared/components/lifecycle-timeline/lifecycle-timeline.component';
import { HandoverApiService, HandoverApiError } from '../handover-api.service';
import { Handover, HandoverStatus } from '../../../core/models/handover.model';
import { AuthService } from '../../../core/auth/auth.service';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-handover-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SkeletonComponent,
    LifecycleTimelineComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      <!-- Loading Skeleton View -->
      @if (isLoading()) {
        <div class="flex flex-col gap-6" aria-busy="true" [attr.aria-label]="isRtl ? 'جاري تحميل بيانات التسليم...' : 'Loading handover details...'">
          <!-- Header Skeleton -->
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <app-skeleton variant="text" width="220px" height="28px"></app-skeleton>
              <app-skeleton variant="text" width="340px" height="16px"></app-skeleton>
            </div>
            <app-skeleton variant="rectangular" width="120px" height="32px"></app-skeleton>
          </div>

          <!-- Timeline Skeleton -->
          <app-card padding="md" variant="bordered">
            <div class="py-4 flex items-center justify-between gap-4">
              @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
                <div class="flex flex-col items-center gap-2 flex-1">
                  <app-skeleton variant="circular" width="32px" height="32px"></app-skeleton>
                  <app-skeleton variant="text" width="40px" height="12px"></app-skeleton>
                </div>
              }
            </div>
          </app-card>

          <!-- Content Skeleton -->
          <app-card padding="lg" variant="bordered">
            <div class="space-y-6">
              <app-skeleton variant="text" width="280px" height="24px"></app-skeleton>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-skeleton variant="rectangular" height="88px"></app-skeleton>
                <app-skeleton variant="rectangular" height="88px"></app-skeleton>
              </div>
              <div class="flex justify-center pt-4">
                <app-skeleton variant="rectangular" width="220px" height="48px"></app-skeleton>
              </div>
            </div>
          </app-card>
        </div>
      } @else {
        <!-- Page Header -->
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-neutral-900">
                {{ isRtl ? 'بروتوكول تسليم واستلام المورد' : 'Resource Handover Protocol' }}
              </h1>
              <span class="text-xs font-mono text-neutral-400">#{{ matchId() }}</span>
            </div>
            <p class="text-sm text-neutral-600 mt-1">
              {{ isRtl ? 'الضمانة الأساسية للمنصة: لا تكتمل أي عملية تدوير إلا بعد تأكيد كلا الطرفين بصورة مستقلة وموثقة.' : 'Core platform guarantee: no exchange is complete until both parties confirm independently.' }}
            </p>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-auto">
            <app-badge [variant]="headerBadgeVariant()">
              <span class="font-medium">{{ headerBadgeText() }}</span>
            </app-badge>
          </div>
        </header>

        <!-- Persistent Error Banners (403, 404, 409, 500) -->
        @if (error(); as err) {
          <div
            class="p-4 rounded-xl border flex items-start gap-3"
            [ngClass]="{
              'bg-danger-bg border-danger/30 text-danger-900': err.statusCode === 403 || err.statusCode === 500,
              'bg-warning-bg border-warning/30 text-warning-900': err.statusCode === 409 || err.statusCode === 404
            }"
            [attr.role]="err.statusCode === 403 || err.statusCode === 500 ? 'alert' : 'status'"
          >
            <div class="mt-0.5 shrink-0">
              @if (err.statusCode === 403) {
                <svg class="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else {
                <svg class="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>
            <div class="flex-1 text-sm">
              <p class="font-semibold">
                @if (err.statusCode === 403) {
                  {{ isRtl ? 'غير مصرح بتأكيد هذه العملية' : 'Unauthorized to confirm this handover' }}
                } @else if (err.statusCode === 409) {
                  {{ isRtl ? 'العملية غير نشطة حالياً' : 'Handover is no longer active' }}
                } @else if (err.statusCode === 404) {
                  {{ isRtl ? 'لم يتم العثور على سجل التسليم' : 'Handover record not found' }}
                } @else {
                  {{ isRtl ? 'تعذر استكمال الطلب' : 'Failed to complete request' }}
                }
              </p>
              <p class="mt-1 text-xs opacity-90">{{ err.message }}</p>
            </div>
          </div>
        }

        <!-- 1. Lifecycle Timeline Component (Design System §17) -->
        <app-card padding="md" variant="bordered">
          <div class="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 class="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {{ isRtl ? 'مسار دورة حياة المورد (Resource Lifecycle)' : 'Resource Lifecycle Timeline' }}
            </h2>
            <span class="text-xs text-neutral-500">
              {{ isRtl ? 'مرحلة 6 من 8: مرحلة التسليم الميداني' : 'Step 6 of 8: Field Handover Stage' }}
            </span>
          </div>

          <app-lifecycle-timeline
            [currentStep]="timelineCurrentStep()"
            [terminalState]="timelineTerminalState()"
            [cancelledAtStep]="'in_handover'"
            [handoverConfirmation]="handoverConfirmationState()"
          ></app-lifecycle-timeline>
        </app-card>

        <!-- 2. Two-Sided Confirmation Protocol & Action Card (Design System §26) -->
        <app-card padding="lg" [variant]="isCompleted() ? 'sand' : 'bordered'">
          <div class="flex flex-col gap-6">
            <div class="text-center sm:text-start">
              <h2 class="text-lg font-bold text-neutral-900">
                {{ isRtl ? 'حالة التأكيد الثنائي المستقل (Two-Sided Independent Status)' : 'Two-Sided Independent Confirmation Status' }}
              </h2>
              <p class="text-xs text-neutral-500 mt-1">
                {{ isRtl ? 'وفقاً لـ DESIGN.md §26: يتم تمثيل التأكيد بنقطتين مستقلتين لكل طرف، دون دمجها في شريط تقدم أحادي قد يعطي انطباعاً خادعاً باكتمال جزئي.' : 'Per DESIGN.md §26: Confirmation is represented by two independent indicators, never merged into a single progress bar.' }}
              </p>
            </div>

            <!-- Two Independent Indicators Grid (Never a single progress bar) -->
            <div
              id="handover-two-indicators-container"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
              role="region"
              [attr.aria-label]="isRtl ? 'مؤشرات التأكيد المستقلة للطرفين' : 'Two-sided independent confirmation indicators'"
            >
              <!-- Indicator 1: Provider / Donor -->
              <div
                id="indicator-card-provider"
                class="flex items-start gap-4 p-4 rounded-xl border transition-all"
                [ngClass]="{
                  'bg-success-bg/40 border-success/40 ring-1 ring-success/20': providerConfirmed(),
                  'bg-neutral-50 border-neutral-200': !providerConfirmed()
                }"
              >
                <!-- Dot / Check circle indicator -->
                <div
                  id="dot-provider"
                  class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-colors"
                  [ngClass]="{
                    'bg-success text-white': providerConfirmed(),
                    'border-2 border-warning bg-warning-bg/50 text-warning': !providerConfirmed()
                  }"
                  aria-hidden="true"
                >
                  @if (providerConfirmed()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <span class="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></span>
                  }
                </div>

                <!-- Text Labels (Never color alone — DESIGN.md §18 & §30) -->
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {{ isRtl ? 'الطرف الأول: الجهة المانحة (Provider)' : 'First Party: Donor / Provider' }}
                    </span>
                    @if (isProvider()) {
                      <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-100 text-primary">
                        {{ isRtl ? 'أنت' : 'You' }}
                      </span>
                    }
                  </div>
                  <p class="text-sm font-bold text-neutral-900 mt-0.5">
                    {{ providerDisplayName() }}
                  </p>
                  
                  <div class="mt-2 flex items-center gap-1.5 text-xs font-medium" [ngClass]="providerConfirmed() ? 'text-success' : 'text-neutral-600'">
                    @if (providerConfirmed()) {
                      <span class="text-success font-semibold flex items-center gap-1">
                        <span>{{ isRtl ? 'تم تأكيد تسليم المورد بنجاح' : 'Resource handover confirmed successfully' }}</span>
                        <span aria-hidden="true">✓</span>
                      </span>
                    } @else {
                      <span class="text-neutral-600 flex items-center gap-1">
                        <span>{{ isProvider() ? (isRtl ? 'بانتظار قيامك بتأكيد التسليم' : 'Waiting for your confirmation') : (isRtl ? 'بانتظار تأكيد التسليم من المانح' : 'Waiting for donor confirmation') }}</span>
                        <span class="inline-block w-1.5 h-1.5 rounded-full bg-warning"></span>
                      </span>
                    }
                  </div>
                  
                  @if (handover()?.providerConfirmedAt) {
                    <p class="text-[11px] text-neutral-400 mt-1">
                      {{ isRtl ? 'تاريخ التأكيد:' : 'Confirmed at:' }} {{ formatDate(handover()?.providerConfirmedAt) }}
                    </p>
                  }
                </div>
              </div>

              <!-- Indicator 2: Seeker / Recipient -->
              <div
                id="indicator-card-seeker"
                class="flex items-start gap-4 p-4 rounded-xl border transition-all"
                [ngClass]="{
                  'bg-success-bg/40 border-success/40 ring-1 ring-success/20': seekerConfirmed(),
                  'bg-neutral-50 border-neutral-200': !seekerConfirmed()
                }"
              >
                <!-- Dot / Check circle indicator -->
                <div
                  id="dot-seeker"
                  class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-colors"
                  [ngClass]="{
                    'bg-success text-white': seekerConfirmed(),
                    'border-2 border-warning bg-warning-bg/50 text-warning': !seekerConfirmed()
                  }"
                  aria-hidden="true"
                >
                  @if (seekerConfirmed()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <span class="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></span>
                  }
                </div>

                <!-- Text Labels (Never color alone — DESIGN.md §18 & §30) -->
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {{ isRtl ? 'الطرف الثاني: المستفيد / المستلم (Seeker)' : 'Second Party: Beneficiary / Seeker' }}
                    </span>
                    @if (isSeeker()) {
                      <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-100 text-primary">
                        {{ isRtl ? 'أنت' : 'You' }}
                      </span>
                    }
                  </div>
                  <p class="text-sm font-bold text-neutral-900 mt-0.5">
                    {{ seekerDisplayName() }}
                  </p>

                  <div class="mt-2 flex items-center gap-1.5 text-xs font-medium" [ngClass]="seekerConfirmed() ? 'text-success' : 'text-neutral-600'">
                    @if (seekerConfirmed()) {
                      <span class="text-success font-semibold flex items-center gap-1">
                        <span>{{ isRtl ? 'تم تأكيد استلام المورد ومعاينته بنجاح' : 'Resource receipt inspected and confirmed' }}</span>
                        <span aria-hidden="true">✓</span>
                      </span>
                    } @else {
                      <span class="text-neutral-600 flex items-center gap-1">
                        <span>{{ isSeeker() ? (isRtl ? 'بانتظار قيامك بتأكيد الاستلام' : 'Waiting for your receipt confirmation') : (isRtl ? 'بانتظار تأكيد الاستلام من المستفيد' : 'Waiting for recipient confirmation') }}</span>
                        <span class="inline-block w-1.5 h-1.5 rounded-full bg-warning"></span>
                      </span>
                    }
                  </div>

                  @if (handover()?.seekerConfirmedAt) {
                    <p class="text-[11px] text-neutral-400 mt-1">
                      {{ isRtl ? 'تاريخ التأكيد:' : 'Confirmed at:' }} {{ formatDate(handover()?.seekerConfirmedAt) }}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Handover Actions & Confirmation Trigger -->
            @if (!isCompleted() && !isTerminalState()) {
              <div class="flex flex-col items-center justify-center gap-4 pt-4 border-t border-neutral-100">
                <!-- Action for Participant -->
                @if (isParticipant()) {
                  @if (!hasViewerConfirmed()) {
                    <div class="flex flex-col items-center gap-2">
                      <app-button
                        id="confirm-handover-button"
                        variant="primary"
                        size="lg"
                        [isLoading]="isSubmitting()"
                        [disabled]="isSubmitting()"
                        (clicked)="onConfirmHandover()"
                      >
                        <span class="flex items-center gap-2 px-4">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{{ isRtl ? 'تأكيد التسليم' : 'Confirm Handover' }} ({{ isProvider() ? (isRtl ? 'تأكيد التسليم كجهة مانحة' : 'Confirm as Donor') : (isRtl ? 'تأكيد الاستلام كمستفيد' : 'Confirm as Recipient') }})</span>
                        </span>
                      </app-button>
                      <p class="text-[11px] text-neutral-500">
                        {{ isRtl ? 'بالضغط على التأكيد، تقر بإتمام التسليم الفعلي الميداني للمورد بحالته المتفق عليها.' : 'By confirming, you certify that physical handover has taken place in the agreed condition.' }}
                      </p>
                    </div>
                  } @else {
                    <!-- Viewer already confirmed -->
                    <div class="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center max-w-md w-full">
                      <div class="flex items-center justify-center gap-2 text-success font-bold text-sm">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{{ isRtl ? 'تم تسجيل تأكيدك بنجاح' : 'Your confirmation has been recorded' }}</span>
                      </div>
                      <p class="text-xs text-neutral-600 mt-1">
                        {{ isRtl ? ('نحن بانتظار تأكيد الطرف الآخر (' + (isProvider() ? 'المستلم' : 'المانح') + ') لإتمام العملية وتحديث سجل الأثر البيئي.') : ('Waiting on counterpart confirmation (' + (isProvider() ? 'recipient' : 'donor') + ') to complete exchange.') }}
                      </p>
                    </div>
                  }
                } @else {
                  <!-- Observer / Non-party view (UX check, server enforces 403) -->
                  <div class="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center max-w-md">
                    <p class="text-xs text-neutral-600 font-medium">
                      {{ isRtl ? 'أنت تشاهد هذه العملية بصفة مراقب. يقتصر حق تأكيد التسليم على أطراف المطابقة المحددين فقط.' : 'You are viewing this handover as an observer. Confirmation is restricted to match participants.' }}
                    </p>
                  </div>
                }

                <!-- Demo Simulation Affordance for testing counterpart -->
                <div class="pt-2">
                  <button
                    type="button"
                    (click)="onSimulateCounterpart()"
                    class="text-xs text-neutral-500 hover:text-primary transition-colors flex items-center gap-1.5"
                    [title]="isRtl ? 'مخصص للاختبار والعرض التجريبي لمحاكاة تأكيد الطرف الآخر' : 'For demo and testing: simulate counterpart confirmation'"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{{ isRtl ? 'محاكاة تأكيد الطرف الآخر (عرض تجريبي)' : 'Simulate counterpart confirmation (Demo)' }}</span>
                  </button>
                </div>
              </div>
            }

            <!-- 3. Explicit Unmistakable Success State (Design System §20 & §26, Product Brief §23) -->
            @if (isCompleted()) {
              <div
                id="handover-completion-banner"
                role="status"
                aria-live="polite"
                class="p-6 rounded-2xl bg-success-bg border-2 border-success/30 text-center flex flex-col items-center gap-4 animate-fadeIn"
              >
                <!-- Large Success Badge Icon -->
                <div class="w-16 h-16 rounded-full bg-success text-white flex items-center justify-center shadow-md">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div class="space-y-1.5 max-w-lg">
                  <h3 class="text-xl font-bold text-neutral-900">
                    {{ isRtl ? 'اكتملت العملية بنجاح وتم توثيق الأثر المجتمعي والبيئي!' : 'Handover Completed & Impact Successfully Documented!' }}
                  </h3>
                  <p class="text-sm text-neutral-700 leading-relaxed">
                    {{ isRtl ? 'شكراً لمساهمتك الفعالة في استدامة الموارد الحضرية. تم تسجيل كلا التأكيدين بنجاح، وترقية حالة المورد والطلب، وتحديث سجل الأثر التراكمي في منصة دَوَّرها.' : 'Thank you for actively advancing urban resource sustainability. Both confirmations are recorded, statuses upgraded, and the cumulative impact ledger updated on Dawwarha.' }}
                  </p>
                </div>

                @if (handover()?.completedAt) {
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 border border-success/20 text-xs font-mono text-neutral-700">
                    <svg class="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ isRtl ? 'اكتملت في:' : 'Completed at:' }} {{ formatDate(handover()?.completedAt) }}</span>
                  </span>
                }

                <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <a routerLink="/contributions">
                    <app-button variant="primary" size="md">
                      <span class="flex items-center gap-1.5">
                        <span>{{ isRtl ? 'عرض سجل المساهمات والأثر الموثق' : 'View Contributions & Documented Impact' }}</span>
                        <span aria-hidden="true" class="rtl:rotate-180">→</span>
                      </span>
                    </app-button>
                  </a>

                  <a routerLink="/resources">
                    <app-button variant="secondary" size="md">
                      <span>{{ isRtl ? 'تصفح موارد أخرى' : 'Browse Other Resources' }}</span>
                    </app-button>
                  </a>
                </div>
              </div>
            }

            <!-- 4. Cancelled or Failed State (DESIGN.md §17) -->
            @if (isTerminalState() && !isCompleted()) {
              <div
                class="p-6 rounded-xl border text-center flex flex-col items-center gap-3"
                [ngClass]="handover()?.status === 'cancelled' ? 'bg-neutral-50 border-neutral-300' : 'bg-danger-bg border-danger/30'"
                role="status"
              >
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  [ngClass]="handover()?.status === 'cancelled' ? 'bg-neutral-500' : 'bg-danger'"
                >
                  @if (handover()?.status === 'cancelled') {
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                    </svg>
                  } @else {
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                </div>

                <h3 class="text-base font-bold text-neutral-900">
                  {{ handover()?.status === 'cancelled' ? (isRtl ? 'تم إلغاء عملية التسليم باتفاق الطرفين' : 'Handover Cancelled by Mutual Agreement') : (isRtl ? 'تعذر استكمال عملية التسليم (عدم حضور)' : 'Handover Failed (No-Show)') }}
                </h3>
                <p class="text-xs text-neutral-600 max-w-md">
                  {{ isRtl ? 'وفقاً لقواعد دورة حياة الموارد (Product Brief §11): عند إلغاء التسليم أو تعذره، يعود المورد تلقائياً إلى الحالة "متاح" (Available) ليصبح قابلاً للمطابقة مرة أخرى.' : 'Per resource lifecycle rules: upon cancellation or failure, the resource automatically returns to "available" status.' }}
                </p>

                <div class="pt-2">
                  <a routerLink="/resources">
                    <app-button variant="secondary" size="sm">
                      {{ isRtl ? 'العودة لقائمة الموارد المتاحة' : 'Back to Available Resources' }}
                    </app-button>
                  </a>
                </div>
              </div>
            }
          </div>
        </app-card>
      }
    </div>
  `
})
export class HandoverDetailComponent implements OnInit {
  protected languageService = injectLanguageService();

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    const locale = this.isRtl ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private route = inject(ActivatedRoute);
  private handoverApi = inject(HandoverApiService);
  private authService = inject(AuthService);

  readonly matchId = signal<string>('');
  readonly handover = signal<Handover | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly error = signal<HandoverApiError | null>(null);

  // Authentication & viewer identity (client-side DISPLAY ONLY)
  readonly currentUserId = computed(() => this.authService.currentUser()?.id || '');

  readonly isProvider = computed(() => {
    const h = this.handover();
    const uid = this.currentUserId();
    return Boolean(uid && h && h.providerId === uid);
  });

  readonly isSeeker = computed(() => {
    const h = this.handover();
    const uid = this.currentUserId();
    return Boolean(uid && h && h.seekerId === uid);
  });

  readonly isParticipant = computed(() => this.isProvider() || this.isSeeker());

  readonly providerConfirmed = computed(() => Boolean(this.handover()?.confirmedByProvider));
  readonly seekerConfirmed = computed(() => Boolean(this.handover()?.confirmedBySeeker));

  readonly hasViewerConfirmed = computed(() => {
    if (this.isProvider()) return this.providerConfirmed();
    if (this.isSeeker()) return this.seekerConfirmed();
    return false;
  });

  readonly isCompleted = computed(() => {
    const h = this.handover();
    return Boolean(h && (h.status === 'completed' || (h.confirmedByProvider && h.confirmedBySeeker)));
  });

  readonly isTerminalState = computed(() => {
    const s = this.handover()?.status;
    return s === 'cancelled' || s === 'no_show';
  });

  // Timeline Step calculation
  readonly timelineCurrentStep = computed<LifecycleStepId>(() => {
    const h = this.handover();
    if (!h) return 'in_handover';
    if (h.status === 'completed' || (h.confirmedByProvider && h.confirmedBySeeker)) {
      return 'impact';
    }
    return 'in_handover';
  });

  readonly timelineTerminalState = computed<'none' | 'cancelled' | 'failed'>(() => {
    const s = this.handover()?.status;
    if (s === 'cancelled') return 'cancelled';
    if (s === 'no_show') return 'failed';
    return 'none';
  });

  readonly handoverConfirmationState = computed<HandoverConfirmationState | null>(() => {
    const h = this.handover();
    if (!h) return null;

    return {
      confirmedByProvider: Boolean(h.confirmedByProvider),
      confirmedBySeeker: Boolean(h.confirmedBySeeker),
      isViewerProvider: this.isProvider(),
      providerLabel: this.getProviderLabelText(),
      seekerLabel: this.getSeekerLabelText()
    };
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('matchId') || '';
      this.matchId.set(id);
      if (id) {
        this.loadHandover(id);
      }
    });
  }

  loadHandover(matchId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.handoverApi.getHandover(matchId).subscribe({
      next: (data) => {
        // Map backend _id to model id for consistent identity checks
        const mapped = {
          ...data,
          id: data.id || (data as any)._id,
          providerId: data.providerId ? String(data.providerId) : '',
          seekerId: data.seekerId ? String(data.seekerId) : ''
        };
        this.handover.set(mapped);
        this.isLoading.set(false);
      },
      error: (err: HandoverApiError) => {
        this.error.set(err);
        this.isLoading.set(false);
      }
    });
  }

  onConfirmHandover(): void {
    const id = this.matchId();
    if (!id || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    // Call API with strictly NO side payload (derived server-side)
    this.handoverApi.confirmHandover(id).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);

        // Update state locally
        const current = this.handover();
        if (current) {
          const updated: Handover = {
            ...current,
            status: res.status
          };

          if (this.isProvider()) {
            updated.confirmedByProvider = true;
            updated.providerConfirmedAt = updated.providerConfirmedAt || new Date().toISOString();
          } else if (this.isSeeker()) {
            updated.confirmedBySeeker = true;
            updated.seekerConfirmedAt = updated.seekerConfirmedAt || new Date().toISOString();
          }

          if (res.bothConfirmed || (updated.confirmedByProvider && updated.confirmedBySeeker)) {
            updated.status = 'completed';
            updated.confirmedByProvider = true;
            updated.confirmedBySeeker = true;
            updated.completedAt = updated.completedAt || new Date().toISOString();
          }

          this.handover.set(updated);
          this.handoverApi.setHandoverCache(id, updated);
        }
      },
      error: (err: HandoverApiError) => {
        this.isSubmitting.set(false);
        this.error.set(err);
      }
    });
  }

  onSimulateCounterpart(): void {
    const current = this.handover();
    if (!current) return;

    const updated: Handover = { ...current };
    if (this.isProvider()) {
      updated.confirmedBySeeker = true;
      updated.seekerConfirmedAt = new Date().toISOString();
    } else {
      updated.confirmedByProvider = true;
      updated.providerConfirmedAt = new Date().toISOString();
    }

    if (updated.confirmedByProvider && updated.confirmedBySeeker) {
      updated.status = 'completed';
      updated.completedAt = new Date().toISOString();
    }

    this.handover.set(updated);
    this.handoverApi.setHandoverCache(this.matchId(), updated);
  }

  providerDisplayName(): string {
    if (this.isProvider()) {
      return this.authService.currentUser()?.name || (this.isRtl ? 'الجهة المانحة (أنت)' : 'Provider (You)');
    }
    return this.isRtl ? 'الجهة المانحة للمورد' : 'Supplying Donor';
  }

  seekerDisplayName(): string {
    if (this.isSeeker()) {
      return this.authService.currentUser()?.name || (this.isRtl ? 'الجهة المستفيدة (أنت)' : 'Beneficiary (You)');
    }
    return this.isRtl ? 'الجهة المستفيدة المستلمة' : 'Receiving Beneficiary';
  }

  private getProviderLabelText(): string {
    if (this.providerConfirmed()) {
      return this.isProvider()
        ? (this.isRtl ? 'أنت أكدت التسليم ✓' : 'You confirmed delivery ✓')
        : (this.isRtl ? 'تم تأكيد تسليم المانح ✓' : 'Donor confirmed handover ✓');
    }
    return this.isProvider()
      ? (this.isRtl ? 'بانتظار تأكيدك (مانح)' : 'Waiting for your confirmation (Donor)')
      : (this.isRtl ? 'بانتظار تأكيد المانح' : 'Waiting on donor confirmation');
  }

  private getSeekerLabelText(): string {
    if (this.seekerConfirmed()) {
      return this.isSeeker()
        ? (this.isRtl ? 'أنت أكدت الاستلام ✓' : 'You confirmed receipt ✓')
        : (this.isRtl ? 'تم تأكيد استلام المستفيد ✓' : 'Recipient confirmed receipt ✓');
    }
    return this.isSeeker()
      ? (this.isRtl ? 'بانتظار تأكيدك (مستفيد)' : 'Waiting for your confirmation (Recipient)')
      : (this.isRtl ? 'بانتظار تأكيد المستفيد' : 'Waiting on recipient confirmation');
  }

  headerBadgeVariant(): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    const s = this.handover()?.status;
    if (this.isCompleted()) return 'success';
    if (s === 'cancelled') return 'neutral';
    if (s === 'no_show') return 'danger';
    return 'warning';
  }

  headerBadgeText(): string {
    const s = this.handover()?.status;
    if (this.isCompleted()) return this.isRtl ? 'مكتمل وموثق في سجل الأثر' : 'Completed & Documented in Ledger';
    if (s === 'cancelled') return this.isRtl ? 'تم الإلغاء' : 'Cancelled';
    if (s === 'no_show') return this.isRtl ? 'تعذر التسليم (عدم حضور)' : 'Handover Failed (No-Show)';
    return this.isRtl ? 'بانتظار التأكيد الثنائي' : 'Awaiting Two-Sided Confirmation';
  }
}

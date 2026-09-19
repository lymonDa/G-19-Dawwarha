import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReportApiService } from '../report-api.service';
import { ReportTargetType, ReportReason, Report } from '../../../core/models/report.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-report-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="w-full max-w-lg mx-auto">
      @if (submittedReport()) {
        <!-- Success State -->
        <app-card padding="lg" variant="bordered">
          <div class="flex flex-col items-center justify-center text-center py-4" role="status" aria-live="polite">
            <div class="w-12 h-12 rounded-full bg-success-bg text-success flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-neutral-900">تم استلام بلاغك بنجاح</h3>
            <p class="text-xs text-neutral-600 mt-1 max-w-xs leading-relaxed">
              شكراً لحرصك على أمان وموثوقية مجتمع دَوَّرها. سيقوم فريق الإشراف بمراجعة البلاغ واتخاذ الإجراء المناسب.
            </p>

            <div class="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-start w-full text-xs">
              <div class="flex justify-between">
                <span class="text-neutral-500">رقم البلاغ:</span>
                <span class="font-mono font-semibold">{{ submittedReport()?.id }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-neutral-500">الحالة الأولية:</span>
                <span class="text-warning font-semibold">مفتوح للمراجعة (Open)</span>
              </div>
            </div>

            <div class="mt-5 flex gap-2">
              <app-button variant="secondary" size="sm" (clicked)="onClose()">
                إغلاق
              </app-button>
            </div>
          </div>
        </app-card>
      } @else {
        <!-- Form State -->
        <app-card padding="lg" variant="bordered">
          <div class="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <div>
              <h2 class="text-base font-bold text-neutral-900">إرسال بلاغ عن مخالفة</h2>
              <p class="text-xs text-neutral-500 mt-0.5">
                الهدف المبلغ عنه: {{ targetTypeLabel }}
              </p>
            </div>
            <span class="text-xs font-mono text-neutral-400">#{{ targetId.slice(-6) }}</span>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="p-3 mb-4 rounded-lg bg-danger-bg border border-danger/30 text-danger-900 text-xs flex items-start gap-2" role="alert">
              <svg class="w-4 h-4 text-danger shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-semibold">تعذر إرسال البلاغ</p>
                <p class="mt-0.5 opacity-90">{{ errorMessage() }}</p>
              </div>
            </div>
          }

          <form [formGroup]="reportForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <!-- Reason Dropdown -->
            <div class="flex flex-col gap-1.5">
              <label for="report-reason" class="text-xs font-semibold text-neutral-900">
                سبب البلاغ <span class="text-danger">*</span>
              </label>
              <select
                id="report-reason"
                formControlName="reason"
                class="w-full px-3 py-2 bg-white text-neutral-900 text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                [attr.aria-invalid]="reportForm.get('reason')?.invalid && reportForm.get('reason')?.touched"
              >
                <option value="" disabled selected>اختر سبب المخالفة...</option>
                <option value="spam">محتوى متكرر أو دعاية مزعجة (Spam)</option>
                <option value="fraud">احتيال أو تضليل في الوصف (Fraud)</option>
                <option value="inappropriate">محتوى غير لائق أو مخالف للآداب (Inappropriate)</option>
                <option value="safety">مخاطر سلامة أو أدوية/مواد محظورة (Safety)</option>
                <option value="other">أسباب أخرى (Other)</option>
              </select>
              @if (reportForm.get('reason')?.touched && reportForm.get('reason')?.invalid) {
                <span class="text-[11px] text-danger">يرجى تحديد سبب البلاغ.</span>
              }
            </div>

            <!-- Description Textarea -->
            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <label for="report-description" class="text-xs font-semibold text-neutral-900">
                  تفاصيل إضافية (اختياري)
                </label>
                <span class="text-[10px] text-neutral-400">
                  {{ reportForm.get('description')?.value?.length || 0 }} / 500
                </span>
              </div>
              <textarea
                id="report-description"
                formControlName="description"
                rows="4"
                maxlength="500"
                placeholder="وضح المشكلة بدقة لمساعدة فريق الإشراف في التحقق..."
                class="w-full px-3 py-2 bg-white text-neutral-900 text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
              @if (reportForm.get('description')?.touched && reportForm.get('description')?.invalid) {
                <span class="text-[11px] text-danger">لا يمكن أن تتجاوز التفاصيل 500 حرف.</span>
              }
            </div>

            <!-- Actions -->
            <div class="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100">
              <app-button
                type="button"
                variant="ghost"
                size="sm"
                (clicked)="onClose()"
              >
                إلغاء
              </app-button>

              <app-button
                type="submit"
                variant="danger"
                size="sm"
                [isLoading]="isSubmitting()"
                [disabled]="isSubmitting() || reportForm.invalid"
              >
                إرسال البلاغ للإدارة
              </app-button>
            </div>
          </form>
        </app-card>
      }
    </div>
  `
})
export class ReportCreateComponent {
  private fb = inject(FormBuilder);
  private reportApi = inject(ReportApiService);

  @Input() targetType: ReportTargetType = 'resource';
  @Input() targetId: string = '';
  @Output() completed = new EventEmitter<Report>();
  @Output() cancelled = new EventEmitter<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submittedReport = signal<Report | null>(null);

  reportForm: FormGroup = this.fb.group({
    reason: ['', Validators.required],
    description: ['', [Validators.maxLength(500)]]
  });

  get targetTypeLabel(): string {
    switch (this.targetType) {
      case 'resource':
        return 'مورد منشور';
      case 'request':
        return 'طلب احتياج';
      case 'user':
        return 'عضو / مستخدم';
      default:
        return 'عنصر';
    }
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    if (!this.targetId) {
      this.errorMessage.set('معرف الكيان المبلغ عنه مفقود.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = {
      targetType: this.targetType,
      targetId: this.targetId,
      reason: this.reportForm.value.reason as ReportReason,
      description: this.reportForm.value.description || undefined
    };

    this.reportApi.createReport(payload).subscribe({
      next: (report) => {
        this.isSubmitting.set(false);
        this.submittedReport.set(report);
        this.completed.emit(report);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.message || 'تعذر تسجيل البلاغ. يرجى مراجعة البيانات.');
      }
    });
  }

  onClose(): void {
    this.cancelled.emit();
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrganizationApiService } from '../organization-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Organization, OrganizationVerificationStatus } from '../../../core/models/organization.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { VerificationBadgeComponent } from '../../../shared/components/verification-badge/verification-badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-org-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    VerificationBadgeComponent,
    SkeletonComponent
  ],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      <!-- Header -->
      <header>
        <h1 class="text-2xl font-bold text-neutral-900">
          {{ isRtl ? 'توثيق الحساب والاعتماد الرسمي للمنظمة' : 'Account Verification & Accreditation' }}
        </h1>
        <p class="text-sm text-neutral-600 mt-1">
          {{ isRtl
            ? 'يمنح التوثيق الرسمي الشارة الخضراء الموثوقة للمنظمة ويعزز ثقة المتبرعين والجهات الشريكة في التوزيع العادل.'
            : 'Official accreditation grants your organization a trusted green badge and builds donor confidence for fair surplus distribution.' }}
        </p>
      </header>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-card padding="md" variant="bordered">
          <div class="space-y-3" aria-busy="true">
            <app-skeleton variant="text" width="220px" height="24px"></app-skeleton>
            <app-skeleton variant="text" width="100%" height="16px"></app-skeleton>
          </div>
        </app-card>
      } @else {
        <!-- Current Verification Status Card (DESIGN.md §25) -->
        <app-card padding="lg" [variant]="statusCardVariant()">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start sm:items-center gap-3">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                [ngClass]="statusIconContainerClass()"
              >
                @if (verificationStatus() === 'verified') {
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else if (verificationStatus() === 'pending') {
                  <svg class="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                } @else if (verificationStatus() === 'rejected') {
                  <svg class="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                } @else {
                  <svg class="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    {{ isRtl ? 'حالة الاعتماد الحالية' : 'Current Verification Status' }}
                  </span>
                  @if (verificationStatus() === 'verified') {
                    <app-verification-badge [status]="'verified'"></app-verification-badge>
                  }
                </div>
                <h3 class="text-base font-bold text-neutral-900 mt-0.5">
                  {{ statusTitle() }}
                </h3>
                <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {{ statusDescription() }}
                </p>
              </div>
            </div>

            <div class="self-start sm:self-auto">
              <app-badge [variant]="statusBadgeVariant()">
                {{ statusBadgeText() }}
              </app-badge>
            </div>
          </div>

          <!-- Rejection Reason Notice if Rejected -->
          @if (verificationStatus() === 'rejected' && rejectionReason()) {
            <div class="mt-4 p-3.5 rounded-xl bg-danger-bg border border-danger/30 text-xs text-danger-900">
              <span class="font-bold block mb-1">
                {{ isRtl ? 'سبب رفض الاعتماد الإداري:' : 'Administrative Rejection Reason:' }}
              </span>
              <p class="leading-relaxed">{{ rejectionReason() }}</p>
              <p class="mt-2 text-[11px] opacity-90 font-medium">
                {{ isRtl
                  ? 'يمكنك إعادة إرفاق وتصحيح الوثائق المطلوبة أدناه وسيعاد فحص الطلب فوراً.'
                  : 'You can update and correct the required documents below and your application will be reviewed again.' }}
              </p>
            </div>
          }
        </app-card>

        <!-- Document Submission Form (Available when unverified, rejected, or updating) -->
        @if (verificationStatus() !== 'verified') {
          <app-card padding="lg" variant="bordered">
            <h3 class="text-base font-bold text-neutral-900 mb-1">
              {{ isRtl
                ? (verificationStatus() === 'rejected' ? 'إعادة تقديم الوثائق الرسمية' : 'رفع الوثائق الرسمية للاعتماد')
                : (verificationStatus() === 'rejected' ? 'Resubmit Official Documents' : 'Upload Verification Documents') }}
            </h3>
            <p class="text-xs text-neutral-600 mb-6 leading-relaxed">
              {{ isRtl
                ? 'يرجى إرفاق رابط إلكتروني مباشر لشهادة الإشهار الصادرة من وزارة التضامن الاجتماعي أو السجل التجاري / وثيقة التسجيل المعتمدة للمنظمة (الحد الأقصى 10 وثائق).'
                : 'Please provide a direct URL to your registration certificate from the Ministry of Social Solidarity, commercial registry, or official mandate (up to 10 documents).' }}
            </p>

            <!-- Success Alert -->
            @if (successMessage()) {
              <div class="p-3 mb-4 rounded-xl bg-success-bg border border-success/30 text-success-900 text-xs flex items-center gap-2" role="status">
                <svg class="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ successMessage() }}</span>
              </div>
            }

            <!-- Error Alert -->
            @if (errorMessage()) {
              <div class="p-3 mb-4 rounded-xl bg-danger-bg border border-danger/30 text-danger-900 text-xs flex items-center gap-2" role="alert">
                <svg class="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="verificationForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <!-- Primary Document Link -->
              <div class="flex flex-col gap-1.5">
                <label for="org-doc-url1" class="text-xs font-semibold text-neutral-900">
                  {{ isRtl ? 'رابط الوثيقة الأساسية (PDF أو صورة معتمدة)' : 'Primary Document Link (PDF or image)' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  id="org-doc-url1"
                  type="url"
                  formControlName="docUrl1"
                  placeholder="https://example.com/registration-cert.pdf"
                  class="w-full px-3 py-2 bg-white text-neutral-900 text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span class="text-[11px] text-neutral-500">
                  {{ isRtl
                    ? 'رابط مباشر من سحابة تخزين (Google Drive, Dropbox, Cloudinary) مع إتاحة صلاحية العرض.'
                    : 'Direct link from cloud storage (Google Drive, Dropbox, Cloudinary) with view access enabled.' }}
                </span>
              </div>

              <!-- Secondary Document Link -->
              <div class="flex flex-col gap-1.5">
                <label for="org-doc-url2" class="text-xs font-semibold text-neutral-900">
                  {{ isRtl ? 'رابط وثيقة ثانوية / تفويض الممثل القانوني (اختياري)' : 'Secondary Document / Authorization (Optional)' }}
                </label>
                <input
                  id="org-doc-url2"
                  type="url"
                  formControlName="docUrl2"
                  placeholder="https://example.com/authorization-letter.pdf"
                  class="w-full px-3 py-2 bg-white text-neutral-900 text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div class="pt-4 flex justify-end">
                <app-button
                  type="submit"
                  variant="primary"
                  size="md"
                  [isLoading]="isSubmitting()"
                  [disabled]="isSubmitting() || verificationForm.invalid"
                >
                  {{ isRtl ? 'إرسال الوثائق للمراجعة الإدارية' : 'Submit Documents for Administrative Review' }}
                </app-button>
              </div>
            </form>
          </app-card>
        }
      }
    </div>
  `
})
export class OrgVerificationComponent implements OnInit {
  protected languageService = injectLanguageService();
  private fb = inject(FormBuilder);
  private orgApi = inject(OrganizationApiService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly organization = signal<Organization | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  verificationForm: FormGroup = this.fb.group({
    docUrl1: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    docUrl2: ['']
  });

  readonly verificationStatus = computed<OrganizationVerificationStatus>(() => {
    return this.organization()?.verificationStatus || 'unverified';
  });

  readonly rejectionReason = computed<string | undefined>(() => {
    return this.organization()?.verificationNotes;
  });

  ngOnInit(): void {
    this.loadOrgData();
  }

  loadOrgData(): void {
    this.isLoading.set(true);
    const orgId = this.authService.currentUser()?.organizationId;

    const orgObs = orgId
      ? this.orgApi.getOrganizationById(orgId)
      : this.orgApi.getMyOrganization();

    orgObs.subscribe({
      next: (org) => {
        this.organization.set(org);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || (this.isRtl ? 'تعذر جلب بيانات المنظمة.' : 'Failed to load organization data.'));
      }
    });
  }

  onSubmit(): void {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    const org = this.organization();
    if (!org) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const docs: string[] = [];
    if (this.verificationForm.value.docUrl1) docs.push(this.verificationForm.value.docUrl1.trim());
    if (this.verificationForm.value.docUrl2) docs.push(this.verificationForm.value.docUrl2.trim());

    this.orgApi.submitVerificationDocuments(org.id, docs).subscribe({
      next: (updatedOrg) => {
        this.isSubmitting.set(false);
        this.organization.set({
          ...updatedOrg,
          verificationStatus: 'pending'
        });
        const msg = this.isRtl
          ? 'تم إرسال وثائق التوثيق بنجاح وهي قيد المراجعة الإدارية من قبل فريق العمل.'
          : 'Verification documents submitted successfully and are now pending administrative review.';
        this.successMessage.set(msg);
        this.toast.success(msg, this.isRtl ? 'تم التقديم بنجاح' : 'Submitted');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errMsg = err?.message || (this.isRtl ? 'تعذر حفظ وثائق التوثيق.' : 'Failed to submit verification documents.');
        this.errorMessage.set(errMsg);
        this.toast.error(errMsg, this.isRtl ? 'خطأ' : 'Error');
      }
    });
  }

  statusCardVariant(): 'bordered' | 'sand' | 'default' {
    return this.verificationStatus() === 'verified' ? 'sand' : 'bordered';
  }

  statusIconContainerClass(): string {
    switch (this.verificationStatus()) {
      case 'verified':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning-bg text-warning border border-warning/30';
      case 'rejected':
        return 'bg-danger-bg text-danger border border-danger/30';
      default:
        return 'bg-neutral-100 text-neutral-500';
    }
  }

  statusBadgeVariant(): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (this.verificationStatus()) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  statusBadgeText(): string {
    switch (this.verificationStatus()) {
      case 'verified':
        return this.isRtl ? 'موثقة رسمياً ✓' : 'Verified ✓';
      case 'pending':
        return this.isRtl ? 'قيد المراجعة الفنية' : 'Under Review';
      case 'rejected':
        return this.isRtl ? 'مرفوض' : 'Rejected';
      default:
        return this.isRtl ? 'غير موثقة' : 'Unverified';
    }
  }

  statusTitle(): string {
    switch (this.verificationStatus()) {
      case 'verified':
        return this.isRtl ? 'تم اعتماد وتوثيق المنظمة رسمياً' : 'Organization is Officially Verified';
      case 'pending':
        return this.isRtl ? 'طلب الاعتماد قيد المراجعة الفنية من الإدارة' : 'Accreditation Request Under Review';
      case 'rejected':
        return this.isRtl ? 'تم رفض طلب الاعتماد السابق' : 'Previous Verification Request Was Rejected';
      default:
        return this.isRtl ? 'الحساب غير موثق حالياً' : 'Organization Currently Unverified';
    }
  }

  statusDescription(): string {
    switch (this.verificationStatus()) {
      case 'verified':
        return this.isRtl
          ? 'تتمتع منظمتك بشارة التوثيق الخضراء وتظهر في دليل المنظمات المعتمدة أمام جميع المتبرعين.'
          : 'Your organization holds the verified green badge and appears in the directory of accredited organizations.';
      case 'pending':
        return this.isRtl
          ? 'وفقاً لقواعد الخصوصية (DESIGN.md §25): تظهر حالة "قيد المراجعة" لك فقط داخل لوحة التحكم ولا يتم إشهارها للعامة.'
          : 'Under privacy rules (DESIGN.md §25): "Under Review" status is visible only inside your dashboard and is never displayed publicly.';
      case 'rejected':
        return this.isRtl
          ? 'تم رفض الوثائق المقدمة. يرجى مراجعة سبب الرفض وإعادة تقديم مستندات رسمية سارية المفعول.'
          : 'The submitted documents were rejected. Please check the feedback and resubmit valid documentation.';
      default:
        return this.isRtl
          ? 'قم برفع وثائق التسجيل الرسمية للحصول على شارة التوثيق وتوسيع نطاق استلام الموارد.'
          : 'Upload official registration documents to obtain verification and expand your community reach.';
    }
  }
}


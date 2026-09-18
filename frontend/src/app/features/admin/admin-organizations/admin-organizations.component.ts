import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { Organization } from '../../../core/models/organization.model';
import { OrganizationCardComponent } from '../../../shared/components/organization-card/organization-card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

@Component({
  selector: 'app-admin-organizations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OrganizationCardComponent,
    SkeletonComponent,
    ButtonComponent,
    DialogComponent,
    TextareaComponent
  ],
  template: `
    <div class="flex flex-col gap-6" [dir]="lang.direction()">
      <!-- Header & Filters -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">{{ lang.t().ADMIN_ORGS_TITLE }}</h1>
          <p class="text-xs text-neutral-500 mt-0.5">{{ lang.t().ADMIN_ORGS_SUBTITLE }}</p>
        </div>

        <div class="flex items-center gap-1.5 p-1 bg-white border border-neutral-200 rounded-lg text-xs">
          <button
            type="button"
            (click)="setFilter('all')"
            class="px-3 py-1 rounded font-medium transition-colors"
            [class.bg-primary]="filter() === 'all'"
            [class.text-white]="filter() === 'all'"
            [class.text-neutral-600]="filter() !== 'all'"
          >
            {{ lang.t().ADMIN_FILTER_ALL }}
          </button>
          <button
            type="button"
            (click)="setFilter('pending')"
            class="px-3 py-1 rounded font-medium transition-colors"
            [class.bg-primary]="filter() === 'pending'"
            [class.text-white]="filter() === 'pending'"
            [class.text-neutral-600]="filter() !== 'pending'"
          >
            {{ lang.t().ADMIN_FILTER_PENDING }}
          </button>
          <button
            type="button"
            (click)="setFilter('verified')"
            class="px-3 py-1 rounded font-medium transition-colors"
            [class.bg-primary]="filter() === 'verified'"
            [class.text-white]="filter() === 'verified'"
            [class.text-neutral-600]="filter() !== 'verified'"
          >
            {{ lang.t().ADMIN_FILTER_VERIFIED }}
          </button>
        </div>
      </div>

      <!-- Organizations Cards List -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-skeleton variant="card"></app-skeleton>
          <app-skeleton variant="card"></app-skeleton>
        </div>
      } @else if (errorMessage()) {
        <!-- Error State (Zero Fake Data) -->
        <div class="p-6 text-center bg-danger-bg/50 border border-danger/20 rounded-xl text-xs text-danger-900 flex flex-col items-center gap-3">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-medium">{{ errorMessage() }}</span>
          </div>
          <app-button variant="secondary" size="sm" (clicked)="loadOrganizations()">
            {{ lang.t().ADMIN_RETRY }}
          </app-button>
        </div>
      } @else if (filteredOrganizations().length === 0) {
        <div class="p-8 text-center bg-white rounded-card border border-neutral-200 text-xs text-neutral-500">
          {{ lang.t().ADMIN_NO_ORGS }}
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (org of filteredOrganizations(); track org.id) {
            <app-organization-card
              [org]="org"
              variant="admin-review"
              [isProcessing]="isProcessingAction() && activeOrgId() === org.id"
              (verify)="handleApprove(org)"
              (reject)="openRejectDialog(org)"
            ></app-organization-card>
          }
        </div>
      }

      <!-- Rejection Reason Dialog (DESIGN.md & Audit §6) -->
      <app-dialog
        [isOpen]="isRejectDialogOpen()"
        [title]="lang.currentLanguage() === 'ar' ? 'رفض اعتماد المنظمة' : 'Reject Organization Verification'"
        [confirmText]="lang.currentLanguage() === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection'"
        [cancelText]="lang.currentLanguage() === 'ar' ? 'إلغاء' : 'Cancel'"
        [confirmVariant]="'danger'"
        [confirmDisabled]="!rejectionReason.trim()"
        [isLoading]="isProcessingAction()"
        (close)="closeRejectDialog()"
        (confirm)="confirmReject()"
      >
        <div class="flex flex-col gap-3">
          <p class="text-xs text-neutral-600 leading-relaxed">
            {{ lang.currentLanguage() === 'ar'
              ? 'يرجى كتابة سبب رفض الاعتماد لتوضيحه لإدارة المنظمة حتى تتمكن من تصحيح الوثائق وإعادة التقديم.'
              : 'Please provide a clear rejection reason. This will be communicated to the organization so they can correct documents and re-submit.' }}
          </p>

          <app-textarea
            [label]="lang.currentLanguage() === 'ar' ? 'سبب الرفض' : 'Rejection Reason'"
            [required]="true"
            [rows]="3"
            [placeholder]="lang.currentLanguage() === 'ar' ? 'مثال: الوثيقة المرفقة منتهية الصلاحية أو غير واضحة...' : 'e.g., The attached registration certificate is expired or unreadable...'"
            [error]="rejectionError"
            [(ngModel)]="rejectionReason"
          ></app-textarea>
        </div>
      </app-dialog>
    </div>
  `
})
export class AdminOrganizationsComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  private toast = inject(ToastService);
  readonly lang = inject(LanguageService);

  readonly organizations = signal<Organization[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly filter = signal<'all' | 'pending' | 'verified' | 'rejected'>('all');

  // Rejection Dialog State
  readonly isRejectDialogOpen = signal(false);
  readonly isProcessingAction = signal(false);
  readonly selectedOrgForReject = signal<Organization | null>(null);
  readonly activeOrgId = signal<string | null>(null);
  rejectionReason = '';
  rejectionError = '';

  ngOnInit(): void {
    this.loadOrganizations();
  }

  setFilter(status: 'all' | 'pending' | 'verified' | 'rejected'): void {
    this.filter.set(status);
  }

  filteredOrganizations(): Organization[] {
    const f = this.filter();
    if (f === 'all') return this.organizations();
    return this.organizations().filter(o => {
      const status = o.verificationStatus;
      if (f === 'verified') return status === 'verified';
      return status === f;
    });
  }

  loadOrganizations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminApi.getOrganizations().subscribe({
      next: (data) => {
        this.organizations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.organizations.set([]);
        this.errorMessage.set(err?.message || 'Failed to load organizations.');
        this.isLoading.set(false);
      }
    });
  }

  handleApprove(org: Organization): void {
    this.isProcessingAction.set(true);
    this.activeOrgId.set(org.id);

    this.adminApi.verifyOrganization(org.id, { decision: 'approved' }).subscribe({
      next: () => {
        this.isProcessingAction.set(false);
        this.activeOrgId.set(null);
        this.toast.success(
          this.lang.currentLanguage() === 'ar'
            ? 'تم توثيق واعتماد المنظمة بنجاح'
            : 'Organization verified and approved successfully'
        );
        this.loadOrganizations();
      },
      error: (err) => {
        this.isProcessingAction.set(false);
        this.activeOrgId.set(null);
        this.toast.error(err?.message || 'Failed to verify organization');
      }
    });
  }

  openRejectDialog(org: Organization): void {
    this.selectedOrgForReject.set(org);
    this.rejectionReason = '';
    this.rejectionError = '';
    this.isRejectDialogOpen.set(true);
  }

  closeRejectDialog(): void {
    if (this.isProcessingAction()) return;
    this.isRejectDialogOpen.set(false);
    this.selectedOrgForReject.set(null);
    this.rejectionReason = '';
    this.rejectionError = '';
  }

  confirmReject(): void {
    const org = this.selectedOrgForReject();
    if (!org) return;

    const trimmedReason = this.rejectionReason.trim();
    if (!trimmedReason) {
      this.rejectionError = this.lang.currentLanguage() === 'ar' ? 'سبب الرفض مطلوب' : 'Rejection reason is required.';
      return;
    }

    this.isProcessingAction.set(true);
    this.activeOrgId.set(org.id);

    this.adminApi.verifyOrganization(org.id, {
      decision: 'rejected',
      rejectionReason: trimmedReason
    }).subscribe({
      next: () => {
        this.isProcessingAction.set(false);
        this.activeOrgId.set(null);
        this.closeRejectDialog();
        this.toast.success(
          this.lang.currentLanguage() === 'ar'
            ? 'تم رفض طلب الاعتماد وإشعار المنظمة'
            : 'Organization verification request rejected'
        );
        this.loadOrganizations();
      },
      error: (err) => {
        this.isProcessingAction.set(false);
        this.activeOrgId.set(null);
        this.toast.error(err?.message || 'Failed to reject organization');
      }
    });
  }
}

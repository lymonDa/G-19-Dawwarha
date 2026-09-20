import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ResourceApiService, CreateResourcePayload, UpdateResourcePayload } from '../resource-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { CategorySelectorComponent } from '../../../shared/components/category-selector/category-selector.component';
import { Resource } from '../../../core/models/resource.model';

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) {
      return { invalidDateRange: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-resource-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    InputComponent,
    TextareaComponent,
    SkeletonComponent,
    CategorySelectorComponent
  ],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      <!-- Back Navigation -->
      <a
        [routerLink]="isEdit ? ['/resources', resourceId] : ['/resources']"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{{ isEdit ? (languageService.isRtl() ? 'العودة لتفاصيل المورد' : 'Back to Resource Details') : (languageService.isRtl() ? 'العودة إلى الموارد' : 'Back to Resources') }}</span>
      </a>

      <!-- Page Heading -->
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          {{ isEdit ? languageService.t().RES_EDIT_TITLE : languageService.t().RES_CREATE_TITLE }}
        </h1>
        <p class="text-sm text-neutral-500 mt-1">
          {{ isEdit
            ? (languageService.isRtl() ? 'تحديث مواصفات المورد الفائض أو الكمية أو نافذة الاستلام والتسليم.' : 'Update the resource specifications, quantity, or pickup window for this listing.')
            : languageService.t().RES_CREATE_SUBTITLE }}
        </p>
      </div>

      <!-- Loading State in Edit Mode -->
      @if (isLoadingResource) {
        <div class="space-y-4">
          <app-skeleton variant="card" height="120px"></app-skeleton>
          <app-skeleton variant="card" height="280px"></app-skeleton>
        </div>
      } @else if (terminalBlocked) {
        <!-- Terminal State Notice -->
        <div class="rounded-card border border-warning/30 bg-warning-bg p-6 text-sm text-neutral-800" role="alert">
          <div class="flex items-start gap-3">
            <svg class="h-6 w-6 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 class="font-bold text-base text-neutral-900">{{ languageService.isRtl() ? 'التعديل مغلق' : 'Editing Locked' }}</h3>
              <p class="mt-1 text-neutral-600">
                {{ languageService.isRtl() ? 'هذا المورد في حالة ' : 'This listing is in status ' }}<span class="font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-neutral-200/80">{{ languageService.getStatusLabel(currentStatus) }}</span>{{ languageService.isRtl() ? ' ولا يمكن تعديل بياناته.' : ' and can no longer be edited.' }}
              </p>
              <div class="mt-4">
                <a [routerLink]="['/resources', resourceId]">
                  <app-button variant="outline" size="sm">{{ languageService.t().COMMON_VIEW_DETAILS }}</app-button>
                </a>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Error Alert Banner -->
        @if (errorMessage) {
          <div class="rounded-card border border-danger/30 bg-danger-bg p-4 text-sm text-danger flex items-center gap-2" role="alert">
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <!-- Reactive Form -->
        <app-card padding="lg">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6" novalidate>
            <!-- 1. Resource Identity -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
                {{ languageService.isRtl() ? '1. تفاصيل ومواصفات المورد' : '1. Resource Details' }}
              </h3>

              <div>
                <app-input
                  [label]="languageService.t().RES_FIELD_TITLE"
                  [placeholder]="languageService.t().RES_FIELD_TITLE_PLACEHOLDER"
                  [required]="true"
                  formControlName="title"
                  [error]="isFieldTouched('title') ? titleError : null"
                ></app-input>
              </div>

              <div>
                <app-category-selector
                  formControlName="categoryId"
                  [required]="true"
                ></app-category-selector>
                @if (categoryError && isFieldTouched('categoryId')) {
                  <p class="text-xs text-danger mt-1">{{ categoryError }}</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-input
                  [label]="languageService.t().RES_FIELD_QUANTITY"
                  type="number"
                  placeholder="1"
                  [required]="true"
                  formControlName="quantity"
                  [error]="isFieldTouched('quantity') ? quantityError : null"
                ></app-input>

                <div class="flex flex-col justify-end">
                  <span class="text-xs text-neutral-400 mb-2">{{ languageService.isRtl() ? 'يجب ألا تقل الكمية عن وحدة واحدة' : 'Must be at least 1 unit' }}</span>
                </div>
              </div>

              <div>
                <app-textarea
                  [label]="languageService.t().COMMON_DESCRIPTION"
                  [placeholder]="languageService.isRtl() ? 'صف مواصفات المورد، وحالته التشغيلية، وأي تفاصيل مهمة للمستفيدين...' : 'Describe the resource specs, condition, and any important details for recipients...'"
                  [required]="true"
                  [rows]="4"
                  formControlName="description"
                  [error]="isFieldTouched('description') ? descriptionError : null"
                ></app-textarea>
              </div>
            </div>

            <!-- 2. Location Section -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
                {{ languageService.isRtl() ? '2. موقع الاستلام والتسليم' : '2. Pickup Location' }}
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-input
                  [label]="languageService.isRtl() ? 'المحافظة / المدينة' : 'City'"
                  [placeholder]="languageService.isRtl() ? 'مثال: القاهرة' : 'e.g. Cairo'"
                  [required]="true"
                  formControlName="city"
                  [error]="isFieldTouched('city') ? cityError : null"
                ></app-input>

                <app-input
                  [label]="languageService.isRtl() ? 'المنطقة / الحي' : 'Neighborhood / Area'"
                  [placeholder]="languageService.isRtl() ? 'مثال: المعادي' : 'e.g. Maadi'"
                  formControlName="area"
                ></app-input>
              </div>
            </div>

            <!-- 3. Availability Window (Backend Mandated) -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
                {{ languageService.isRtl() ? '3. نافذة الإتاحة للاستلام' : '3. Availability Window' }}
              </h3>
              <p class="text-xs text-neutral-500">
                {{ languageService.isRtl() ? 'حدد الفترة الزمنية التي يكون فيها المورد جاهزاً للاستلام والتسليم.' : 'Specify the timeframe during which this resource is ready for collection.' }}
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-neutral-900">
                    {{ languageService.isRtl() ? 'متاح من تاريخ' : 'Available From' }} <span class="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    formControlName="startDate"
                    class="w-full rounded-md border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  @if (startDateError && isFieldTouched('startDate')) {
                    <p class="text-xs text-danger">{{ startDateError }}</p>
                  }
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-neutral-900">
                    {{ languageService.isRtl() ? 'متاح حتى تاريخ' : 'Available Until' }} <span class="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    formControlName="endDate"
                    class="w-full rounded-md border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  @if (endDateError && isFieldTouched('endDate')) {
                    <p class="text-xs text-danger">{{ endDateError }}</p>
                  }
                </div>
              </div>

              @if (form.errors?.['invalidDateRange'] && (form.get('endDate')?.touched || form.get('startDate')?.touched)) {
                <div class="text-xs text-danger font-medium mt-1">
                  {{ languageService.isRtl() ? 'يجب أن يكون تاريخ انتهاء الإتاحة بعد تاريخ البدء.' : 'Availability end date must be strictly after the start date.' }}
                </div>
              }
            </div>

            <!-- 4. Safety & Compliance Disclosure -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
                {{ languageService.isRtl() ? '4. إفصاح السلامة والحالة (اختياري)' : '4. Safety & Condition Disclosure (Optional)' }}
              </h3>

              <app-textarea
                [label]="languageService.isRtl() ? 'ملاحظات السلامة والتخزين' : 'Safety Notes'"
                [placeholder]="languageService.isRtl() ? 'وضّح أي متطلبات تخزين خاصة، أو شروط نقل، أو تعليمات سلامة...' : 'Disclose any storage requirements, expiration notices, or sanitized handling details...'"
                [rows]="2"
                formControlName="safetyDisclosure"
              ></app-textarea>
            </div>

            <!-- Form Submission Action -->
            <div class="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
              <a [routerLink]="isEdit ? ['/resources', resourceId] : ['/resources']">
                <app-button variant="outline" type="button">{{ languageService.t().COMMON_CANCEL }}</app-button>
              </a>

              <app-button
                variant="primary"
                type="submit"
                [isLoading]="isSubmitting"
                [disabled]="isSubmitting"
              >
                {{ isEdit ? languageService.t().COMMON_SAVE : languageService.t().RES_SUBMIT_CREATE }}
              </app-button>
            </div>
          </form>
        </app-card>
      }
    </div>
  `
})
export class ResourceCreateComponent implements OnInit {
  languageService = inject(LanguageService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resourceApi = inject(ResourceApiService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isEdit = false;
  resourceId: string | null = null;
  isLoadingResource = false;
  isSubmitting = false;
  terminalBlocked = false;
  currentStatus = '';
  errorMessage: string | null = null;

  readonly form: FormGroup = this.fb.group(
    {
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      categoryId: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      city: ['', [Validators.required]],
      area: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      safetyDisclosure: ['']
    },
    { validators: dateRangeValidator }
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.resourceId = id;
      this.loadResourceForEdit(id);
    }
  }

  isFieldTouched(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && (c.touched || c.dirty));
  }

  get titleError(): string | null {
    const ctrl = this.form.get('title');
    const isAr = this.languageService.isRtl();
    if (ctrl?.errors) {
      if (ctrl.errors['required']) return isAr ? 'عنوان المورد مطلوب' : 'Title is required';
      if (ctrl.errors['minlength']) return isAr ? 'يجب ألا يقل العنوان عن 3 أحرف' : 'Title must be at least 3 characters';
      if (ctrl.errors['maxlength']) return isAr ? 'يجب ألا يتجاوز العنوان 100 حرف' : 'Title must be at most 100 characters';
    }
    return null;
  }

  get categoryError(): string | null {
    const ctrl = this.form.get('categoryId');
    const isAr = this.languageService.isRtl();
    if (ctrl?.errors?.['required']) {
      return isAr ? 'يرجى اختيار التصنيف' : 'Category is required';
    }
    return null;
  }

  get quantityError(): string | null {
    const ctrl = this.form.get('quantity');
    const isAr = this.languageService.isRtl();
    if (ctrl?.errors) {
      if (ctrl.errors['required']) return isAr ? 'الكمية مطلوبة' : 'Quantity is required';
      if (ctrl.errors['min']) return isAr ? 'يجب أن تكون الكمية 1 على الأقل' : 'Quantity must be greater than 0';
    }
    return null;
  }

  get descriptionError(): string | null {
    const ctrl = this.form.get('description');
    const isAr = this.languageService.isRtl();
    if (ctrl?.errors) {
      if (ctrl.errors['required']) return isAr ? 'الوصف مطلوب' : 'Description is required';
      if (ctrl.errors['maxlength']) return isAr ? 'يجب ألا يتجاوز الوصف 1000 حرف' : 'Description must be at most 1000 characters';
    }
    return null;
  }

  get cityError(): string | null {
    const ctrl = this.form.get('city');
    const isAr = this.languageService.isRtl();
    if (ctrl?.errors?.['required']) {
      return isAr ? 'المدينة / المحافظة مطلوبة' : 'City is required';
    }
    return null;
  }

  get startDateError(): string | null {
    const ctrl = this.form.get('startDate');
    const isAr = this.languageService.isRtl();
    if (ctrl?.errors?.['required']) {
      return isAr ? 'تاريخ بدء الإتاحة مطلوب' : 'Start date is required';
    }
    return null;
  }

  get endDateError(): string | null {
    const ctrl = this.form.get('endDate');
    const isAr = this.languageService.isRtl();
    if (ctrl?.errors?.['required']) {
      return isAr ? 'تاريخ انتهاء الإتاحة مطلوب' : 'End date is required';
    }
    return null;
  }

  private loadResourceForEdit(id: string): void {
    this.isLoadingResource = true;
    this.resourceApi.get(id).subscribe({
      next: (resource: Resource) => {
        this.isLoadingResource = false;
        this.currentStatus = resource.status;

        // Terminal state check per Backend Plan Section 16 (terminal listings cannot be edited)
        const terminalStates = ['completed', 'impact_recorded', 'cancelled', 'expired'];
        if (terminalStates.includes(resource.status)) {
          this.terminalBlocked = true;
          return;
        }

        // Authorization check: owner or admin
        const currentUserId = this.authService.currentUser()?.id || this.authService.currentUser()?._id;
        const providerId = typeof resource.providerId === 'object' && resource.providerId !== null
          ? (resource.providerId as any)._id || (resource.providerId as any).id
          : resource.providerId;

        const isOwner = currentUserId && String(providerId) === String(currentUserId);
        const isAdmin = this.authService.isAdmin();

        if (!isOwner && !isAdmin) {
          this.errorMessage = "You do not have permission to edit this resource.";
          this.terminalBlocked = true;
          return;
        }

        // Pre-fill form
        const categoryId = typeof resource.categoryId === 'object' && resource.categoryId !== null
          ? (resource.categoryId as any)._id || (resource.categoryId as any).id
          : resource.categoryId;

        const startDate = resource.availabilityWindow?.start
          ? this.formatDateForInput(resource.availabilityWindow.start)
          : '';
        const endDate = resource.availabilityWindow?.end
          ? this.formatDateForInput(resource.availabilityWindow.end)
          : '';

        this.form.patchValue({
          title: resource.title || '',
          categoryId: categoryId || null,
          quantity: resource.quantity || 1,
          description: resource.description || '',
          city: resource.location?.city || '',
          area: resource.location?.area || '',
          startDate,
          endDate,
          safetyDisclosure: resource.safetyDisclosure || ''
        });
      },
      error: (err) => {
        this.isLoadingResource = false;
        this.errorMessage = err?.error?.error?.message || err?.error?.message || 'Could not load resource details.';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSubmitting || this.terminalBlocked) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    const val = this.form.value;
    const startIso = new Date(val.startDate).toISOString();
    const endIso = new Date(val.endDate).toISOString();

    if (this.isEdit && this.resourceId) {
      const payload: UpdateResourcePayload = {
        title: val.title.trim(),
        categoryId: val.categoryId,
        quantity: Number(val.quantity),
        description: val.description.trim(),
        location: {
          city: val.city.trim(),
          area: val.area ? val.area.trim() : undefined
        },
        availabilityWindow: {
          start: startIso,
          end: endIso
        },
        safetyDisclosure: val.safetyDisclosure ? val.safetyDisclosure.trim() : undefined
      };

      this.resourceApi.update(this.resourceId, payload).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.toast.success(this.languageService.isRtl() ? 'تم تحديث بيانات المورد بنجاح' : 'Resource updated successfully');
          this.router.navigate(['/resources', updated.id]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.error?.message || err?.error?.message || (this.languageService.isRtl() ? 'فشل تحديث المورد.' : 'Failed to update resource.');
        }
      });
    } else {
      const payload: CreateResourcePayload = {
        title: val.title.trim(),
        categoryId: val.categoryId,
        quantity: Number(val.quantity),
        description: val.description.trim(),
        location: {
          city: val.city.trim(),
          area: val.area ? val.area.trim() : undefined
        },
        availabilityWindow: {
          start: startIso,
          end: endIso
        },
        safetyDisclosure: val.safetyDisclosure ? val.safetyDisclosure.trim() : undefined
      };

      this.resourceApi.create(payload).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.toast.success(this.languageService.isRtl() ? 'تم نشر المورد الفائض بنجاح' : 'Resource listed successfully');
          this.router.navigate(['/resources', created.id]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.error?.message || err?.error?.message || (this.languageService.isRtl() ? 'فشل نشر المورد.' : 'Failed to list resource.');
        }
      });
    }
  }

  private formatDateForInput(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
}

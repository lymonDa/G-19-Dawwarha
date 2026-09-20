import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { CategorySelectorComponent } from '../../../shared/components/category-selector/category-selector.component';
import { RequestPayload } from '../../../core/models/request.model';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CategorySelectorComponent,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl">
        <!-- Breadcrumb / Back Link -->
        <a
          routerLink="/requests"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{{ isRtl ? 'العودة إلى الطلبات' : 'Back to Requests' }}</span>
        </a>

        <!-- Page Title -->
        <div class="mt-4">
          <h1 class="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {{ isEdit ? (isRtl ? 'تعديل طلب الاحتياج' : 'Edit Demand Request') : (isRtl ? 'تسجيل طلب احتياج جديد' : 'Create New Demand Request') }}
          </h1>
          <p class="mt-1 text-sm text-neutral-500">
            {{ isRtl ? 'حدد المواد أو المستلزمات التي يحتاجها مجتمعك أو منظمتك لتيسير مطابقتها.' : 'Specify what materials or equipment your community or organization needs.' }}
          </p>
        </div>

        <!-- Error Alert Banner -->
        @if (errorMessage) {
          <div class="mt-6 rounded-card border border-danger/30 bg-danger-bg p-4 text-sm text-danger" role="alert">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </div>
        }

        <!-- Form Container -->
        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="mt-6 space-y-6 rounded-card border border-neutral-200 bg-neutral-0 p-6 shadow-sm sm:p-8"
        >
          <!-- Section 1: Item & Demand Specifications -->
          <div>
            <h2 class="text-base font-semibold text-neutral-900">
              {{ isRtl ? '1. مواصفات الاحتياج' : '1. Demand Specifications' }}
            </h2>
            <p class="mt-0.5 text-xs text-neutral-500">
              {{ isRtl ? 'وضّح للجهات المانحة نوع المورد أو الاحتياج المطلوب بدقة.' : 'Tell providers what kind of item you are requesting.' }}
            </p>

            <div class="mt-4 space-y-4">
              <!-- Category Selection -->
              <div>
                <label for="category-selector" class="block text-sm font-semibold text-neutral-900">
                  {{ isRtl ? 'التصنيف' : 'Category' }} <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <div class="mt-1">
                  <app-category-selector
                    formControlName="categoryId"
                  />
                </div>
                @if (isFieldInvalid('categoryId')) {
                  <p class="mt-1 text-xs text-danger" role="alert">
                    {{ isRtl ? 'التصنيف مطلوب.' : 'Category is required.' }}
                  </p>
                }
              </div>

              <!-- Quantity Input -->
              <div>
                <label for="quantity" class="block text-sm font-semibold text-neutral-900">
                  {{ isRtl ? 'الكمية المطلوبة' : 'Quantity Needed' }} <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <div class="mt-1">
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    formControlName="quantity"
                    [placeholder]="isRtl ? 'مثال: 5' : 'e.g. 5'"
                    class="w-full rounded-lg border border-neutral-200 bg-neutral-0 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
                    [ngClass]="{ 'border-danger focus:border-danger focus:ring-danger': isFieldInvalid('quantity') }"
                  />
                </div>
                @if (isFieldInvalid('quantity')) {
                  <p class="mt-1 text-xs text-danger" role="alert">
                    {{ isRtl ? 'الكمية يجب أن تكون 1 على الأقل.' : 'Quantity must be at least 1.' }}
                  </p>
                }
              </div>

              <!-- Urgency Level: Mobile Responsive Grid (320px-390px safe) -->
              <div>
                <label class="block text-sm font-semibold text-neutral-900">
                  {{ isRtl ? 'درجة الإلحاح والأولوية' : 'Urgency Level' }} <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <p class="mt-0.5 text-xs text-neutral-500">
                  {{ isRtl ? 'تساعد درجة الإلحاح نظام المطابقة على تقديم الاحتياجات الأكثر ضرورة أولاً.' : 'Urgency helps matching rank higher priority needs first.' }}
                </p>
                <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    class="flex cursor-pointer flex-col items-center rounded-lg border p-3 text-center transition"
                    [ngClass]="form.get('urgency')?.value === 'low'
                      ? 'border-info bg-info-bg/40 font-semibold text-info'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'"
                  >
                    <input type="radio" formControlName="urgency" value="low" class="sr-only" />
                    <span class="text-sm">{{ isRtl ? 'منخفض' : 'Low' }}</span>
                    <span class="mt-1 text-[11px] text-neutral-500">{{ isRtl ? 'وقت مرن' : 'Flexible timeline' }}</span>
                  </label>

                  <label
                    class="flex cursor-pointer flex-col items-center rounded-lg border p-3 text-center transition"
                    [ngClass]="form.get('urgency')?.value === 'medium'
                      ? 'border-warning bg-warning-bg/40 font-semibold text-warning'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'"
                  >
                    <input type="radio" formControlName="urgency" value="medium" class="sr-only" />
                    <span class="text-sm">{{ isRtl ? 'متوسط' : 'Medium' }}</span>
                    <span class="mt-1 text-[11px] text-neutral-500">{{ isRtl ? 'خلال أسبوع إلى أسبوعين' : 'Within 1–2 weeks' }}</span>
                  </label>

                  <label
                    class="flex cursor-pointer flex-col items-center rounded-lg border p-3 text-center transition"
                    [ngClass]="form.get('urgency')?.value === 'high'
                      ? 'border-danger bg-danger-bg/40 font-semibold text-danger'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'"
                  >
                    <input type="radio" formControlName="urgency" value="high" class="sr-only" />
                    <span class="text-sm">{{ isRtl ? 'عالي' : 'High' }}</span>
                    <span class="mt-1 text-[11px] text-neutral-500">{{ isRtl ? 'حاجة عاجلة وفورية' : 'Immediate need' }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <hr class="border-neutral-200" />

          <!-- Section 2: Location & Description -->
          <div>
            <h2 class="text-base font-semibold text-neutral-900">
              {{ isRtl ? '2. الموقع والتفاصيل' : '2. Location & Context' }}
            </h2>
            <p class="mt-0.5 text-xs text-neutral-500">
              {{ isRtl ? 'أين ينبغي تسليم المورد أو استلامه؟' : 'Where should the resource be delivered or picked up?' }}
            </p>

            <div class="mt-4 space-y-4">
              <div formGroupName="location" class="grid gap-3 sm:grid-cols-2">
                <!-- City -->
                <div>
                  <label for="city" class="block text-sm font-semibold text-neutral-900">
                    {{ isRtl ? 'المدينة / المحافظة' : 'City' }} <span class="text-danger" aria-hidden="true">*</span>
                  </label>
                  <div class="mt-1">
                    <input
                      id="city"
                      type="text"
                      formControlName="city"
                      [placeholder]="isRtl ? 'مثال: القاهرة' : 'e.g. Cairo'"
                      class="w-full rounded-lg border border-neutral-200 bg-neutral-0 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
                      [ngClass]="{ 'border-danger focus:border-danger focus:ring-danger': isLocationFieldInvalid('city') }"
                    />
                  </div>
                  @if (isLocationFieldInvalid('city')) {
                    <p class="mt-1 text-xs text-danger" role="alert">
                      {{ isRtl ? 'المدينة مطلوبة.' : 'City is required.' }}
                    </p>
                  }
                </div>

                <!-- Area -->
                <div>
                  <label for="area" class="block text-sm font-semibold text-neutral-900">
                    {{ isRtl ? 'المنطقة / الحي' : 'Area / Neighborhood' }}
                  </label>
                  <div class="mt-1">
                    <input
                      id="area"
                      type="text"
                      formControlName="area"
                      [placeholder]="isRtl ? 'مثال: المعادي' : 'e.g. Maadi'"
                      class="w-full rounded-lg border border-neutral-200 bg-neutral-0 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <div class="flex items-center justify-between">
                  <label for="description" class="block text-sm font-semibold text-neutral-900">
                    {{ isRtl ? 'وصف تفصيلي للاحتياج' : 'Detailed Description' }}
                  </label>
                  <span class="text-xs text-neutral-400">
                    {{ form.get('description')?.value?.length || 0 }}/500
                  </span>
                </div>
                <div class="mt-1">
                  <textarea
                    id="description"
                    rows="4"
                    maxlength="500"
                    formControlName="description"
                    [placeholder]="isRtl ? 'اذكر أي مواصفات إضافية، تفضيلات الحالة، أو سياق التوزيع...' : 'Provide any additional specifications, condition preferences, or context...'"
                    class="w-full rounded-lg border border-neutral-200 bg-neutral-0 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons via Shared app-button -->
          <div class="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
            <a
              routerLink="/requests"
              class="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              {{ isRtl ? 'إلغاء' : 'Cancel' }}
            </a>

            <app-button
              type="submit"
              variant="primary"
              [isLoading]="saving"
              [disabled]="form.disabled || saving"
            >
              {{ isEdit ? (isRtl ? 'حفظ التعديلات' : 'Update Request') : (isRtl ? 'نشر الطلب' : 'Submit Request') }}
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RequestFormComponent implements OnInit {
  protected languageService = injectLanguageService();

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  isEdit = false;
  requestId = '';
  loading = false;
  saving = false;
  errorMessage = '';

  form: FormGroup;

  private fb = inject(FormBuilder);
  private api = inject(RequestApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  constructor() {
    this.form = this.fb.group({
      categoryId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      urgency: ['medium', [Validators.required]],
      location: this.fb.group({
        city: ['', [Validators.required]],
        area: ['']
      }),
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.requestId;

    if (this.isEdit) {
      this.loadExistingRequest();
    }
  }

  loadExistingRequest(): void {
    this.loading = true;
    this.api.getById(this.requestId).subscribe({
      next: (req) => {
        // Guard against terminal states (per backend and product rules)
        const isTerminal =
          req.status === 'accepted' ||
          req.status === 'fulfilled' ||
          req.status === 'cancelled' ||
          req.status === 'expired';

        if (isTerminal) {
          const statusLabel = this.languageService?.getStatusLabel(req.status) || req.status;
          this.errorMessage = this.isRtl
            ? `هذا الطلب بحالة ${statusLabel} ولا يمكن تعديله.`
            : `This request is ${req.status} and can no longer be edited.`;
          this.form.disable();
          this.loading = false;
          return;
        }

        const catId = typeof req.categoryId === 'object'
          ? req.categoryId?._id || req.categoryId?.id
          : req.categoryId;

        this.form.patchValue({
          categoryId: catId || '',
          quantity: req.quantity || 1,
          urgency: req.urgency || 'medium',
          location: {
            city: req.location?.city || '',
            area: req.location?.area || ''
          },
          description: req.description || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل تحميل بيانات الطلب للتعديل.' : 'Failed to load request for editing.');
      }
    });
  }

  isFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  isLocationFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(`location.${name}`);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  submit(): void {
    if (this.form.invalid || this.form.disabled) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();
    const payload: RequestPayload = {
      categoryId: raw.categoryId,
      quantity: Number(raw.quantity),
      urgency: raw.urgency,
      location: {
        city: raw.location.city.trim(),
        area: (raw.location.area || '').trim()
      },
      description: (raw.description || '').trim()
    };

    const action$ = this.isEdit
      ? this.api.update(this.requestId, payload)
      : this.api.create(payload);

    action$.subscribe({
      next: (createdOrUpdated) => {
        this.saving = false;
        this.toast.success(
          this.isEdit
            ? (this.isRtl ? 'تم تحديث الطلب بنجاح.' : 'Request updated successfully.')
            : (this.isRtl ? 'تم تسجيل الطلب بنجاح.' : 'Request created successfully.')
        );
        const targetId = createdOrUpdated?._id || createdOrUpdated?.id || this.requestId;
        if (targetId) {
          this.router.navigate(['/requests', targetId]);
        } else {
          this.router.navigate(['/requests']);
        }
      },
      error: (err) => {
        this.saving = false;
        if (err.status === 409) {
          this.errorMessage = this.isRtl
            ? 'يوجد طلب متعارض بالفعل أو لا يمكن تعديل الطلب في حالته الراهنة.'
            : 'A conflicting request already exists or cannot be modified in its current state.';
        } else if (err.status === 403) {
          this.errorMessage = this.isRtl
            ? 'ليس لديك الصلاحية لتنفيذ هذا الإجراء.'
            : 'You do not have permission to perform this action.';
        } else {
          this.errorMessage = err?.error?.error?.message || err?.error?.message || (this.isRtl ? 'حدث خطأ أثناء حفظ الطلب.' : 'An error occurred while saving the request.');
        }
        this.toast.error(this.errorMessage);
      }
    });
  }
}
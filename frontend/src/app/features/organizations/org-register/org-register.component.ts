import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationApiService } from '../organization-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { OrganizationType } from '../../../core/models/organization.model';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-org-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    SelectComponent,
    TextareaComponent
  ],
  template: `
    <div class="max-w-2xl mx-auto py-8">
      <div class="flex flex-col gap-6">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">
            {{ isRtl ? 'تسجيل منظمة أهلية' : 'Register a Civil Organization' }}
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            {{ isRtl
              ? 'سجل منظمتك لتتمكن من تقديم طلبات الاحتياج للمستفيدين، ونشر قوائم النواقص الدورية، والحصول على الاعتماد الرسمي.'
              : 'Register your organization to request resources on its behalf, post periodic needs lists, and get verified on the platform.' }}
          </p>
        </div>

        <app-card padding="lg">
          <form [formGroup]="orgForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <app-input
              [label]="isRtl ? 'اسم المنظمة' : 'Organization Name'"
              [placeholder]="isRtl ? 'مثال: جمعية الأمل لرعاية الأيتام' : 'e.g. Al-Amal Association for Orphan Care'"
              formControlName="name"
              [required]="true"
              [error]="getFieldError('name')"
            ></app-input>

            <app-select
              [label]="isRtl ? 'نوع المنظمة' : 'Organization Type'"
              [required]="true"
              [options]="orgTypeOptions()"
              formControlName="type"
              [error]="getFieldError('type')"
            ></app-select>

            <app-input
              [label]="isRtl ? 'رقم الإشهار / التسجيل الرسمي (إن وجد)' : 'Official Registration / License Number (if applicable)'"
              [placeholder]="isRtl ? 'رقم القيد بوزارة التضامن الاجتماعي' : 'Ministry of Social Solidarity registration number'"
              formControlName="registrationNumber"
            ></app-input>

            <app-textarea
              [label]="isRtl ? 'نبذة عن أنشطة المنظمة' : 'About the Organization Activities'"
              [placeholder]="isRtl ? 'اكتب نبذة مختصرة عن نطاق عمل المنظمة الإنساني أو التنموي...' : 'Write a brief description of your development or humanitarian focus...'"
              [rows]="3"
              formControlName="description"
            ></app-textarea>

            <!-- Contact Fields -->
            <div class="pt-2 border-t border-neutral-100 flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-neutral-900">
                {{ isRtl ? 'بيانات التواصل والمقر' : 'Contact & Location Details' }}
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-input
                  [label]="isRtl ? 'البريد الإلكتروني الرسمي للمنظمة' : 'Official Organization Email'"
                  type="email"
                  formControlName="email"
                  [required]="true"
                  [error]="getFieldError('email')"
                ></app-input>

                <app-input
                  [label]="isRtl ? 'رقم هاتف المنظمة / المقر' : 'Office / Contact Phone'"
                  type="tel"
                  formControlName="phone"
                  [required]="true"
                  [error]="getFieldError('phone')"
                ></app-input>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-input
                  [label]="isRtl ? 'المحافظة' : 'Governorate'"
                  [placeholder]="isRtl ? 'مثال: القاهرة أو الجيزة' : 'e.g. Cairo or Giza'"
                  formControlName="city"
                  [required]="true"
                  [error]="getFieldError('city')"
                ></app-input>

                <app-input
                  [label]="isRtl ? 'عنوان المقر' : 'Office Address'"
                  [placeholder]="isRtl ? 'الشارع، رقم المبنى، الحي' : 'Street, building number, neighborhood'"
                  formControlName="address"
                  [required]="true"
                  [error]="getFieldError('address')"
                ></app-input>
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <app-button
                type="submit"
                variant="primary"
                [isLoading]="isLoading()"
              >
                {{ isRtl ? 'إرسال طلب التسجيل' : 'Submit Registration Request' }}
              </app-button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `
})
export class OrgRegisterComponent {
  protected languageService = injectLanguageService();
  private fb = inject(FormBuilder);
  private orgApi = inject(OrganizationApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  readonly orgTypeOptions = computed<SelectOption[]>(() => {
    const rtl = this.isRtl;
    return [
      { value: 'ngo', label: rtl ? 'منظمة غير حكومية (NGO)' : 'Non-Governmental Organization (NGO)' },
      { value: 'charity', label: rtl ? 'جمعية خيرية' : 'Charitable Association' },
      { value: 'community_group', label: rtl ? 'مبادرة مجتمعية / شبابية' : 'Community / Youth Initiative' },
      { value: 'educational', label: rtl ? 'مؤسسة تعليمية' : 'Educational Institution' },
      { value: 'other', label: rtl ? 'أخرى' : 'Other' }
    ];
  });

  orgForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['charity', Validators.required],
    registrationNumber: [''],
    description: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    city: ['Cairo', Validators.required],
    address: ['', Validators.required]
  });

  getFieldError(name: string): string | null {
    const control = this.orgForm.get(name);
    if (control?.touched && control.errors) {
      if (control.errors['required']) {
        return this.isRtl ? 'هذا الحقل مطلوب' : 'This field is required';
      }
      if (control.errors['email']) {
        return this.isRtl ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const val = this.orgForm.value;

    const payload = {
      name: val.name,
      type: val.type as OrganizationType,
      registrationNumber: val.registrationNumber,
      description: val.description,
      contactInfo: {
        email: val.email,
        phone: val.phone,
        address: {
          city: val.city,
          street: val.address
        }
      }
    };

    this.orgApi.registerOrganization(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success(
          this.isRtl ? 'تم تسجيل المنظمة بنجاح — ملفكم قيد المراجعة الإدارية.' : 'Organization registered successfully — your profile is under review.',
          this.isRtl ? 'تم التسجيل' : 'Registered'
        );
        this.router.navigate(['/organizations/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error(err?.message || (this.isRtl ? 'تعذر إتمام تسجيل المنظمة.' : 'Could not complete organization registration.'));
      }
    });
  }
}


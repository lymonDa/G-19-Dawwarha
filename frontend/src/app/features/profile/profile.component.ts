import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { injectLanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent],
  template: `
    <div class="max-w-3xl mx-auto flex flex-col gap-6" [dir]="isRtl ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">
            {{ isRtl ? 'ملفي الشخصي' : 'My Profile' }}
          </h1>
          <p class="text-xs text-neutral-500 mt-0.5">
            {{ isRtl ? 'إدارة معلومات حسابك الشخصي وإعدادات الأمان وكلمة المرور.' : 'Manage your account information and security settings.' }}
          </p>
        </div>
        <app-badge [variant]="authService.isAdmin() ? 'danger' : (authService.isOrganization() ? 'sand' : 'neutral')">
          {{ getRoleLabel() }}
        </app-badge>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-card padding="md" variant="bordered">
          <span class="text-xs text-neutral-500">{{ isRtl ? 'إجمالي المساهمات' : 'Total Contributions' }}</span>
          <p class="text-2xl font-bold text-primary mt-1">
            {{ authService.currentUser()?.stats?.contributionsCount || authService.currentUser()?.stats?.completedTransfers || 0 }}
          </p>
        </app-card>

        <app-card padding="md" variant="bordered">
          <span class="text-xs text-neutral-500">{{ isRtl ? 'عمليات التسليم المكتملة' : 'Successful Handovers' }}</span>
          <p class="text-2xl font-bold text-neutral-900 mt-1">
            {{ authService.currentUser()?.stats?.successfulTransfers || 0 }}
          </p>
        </app-card>

        <app-card padding="md" variant="bordered">
          <span class="text-xs text-neutral-500">{{ isRtl ? 'تقييم الموثوقية' : 'Reliability Rating' }}</span>
          <p class="text-2xl font-bold text-success mt-1">
            {{ authService.currentUser()?.stats?.reputationScore ? (authService.currentUser()?.stats?.reputationScore! / 20).toFixed(1) : '5.0' }} / 5
          </p>
        </app-card>
      </div>

      <!-- Profile Edit Form -->
      <app-card padding="lg">
        <h2 class="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
          {{ isRtl ? 'المعلومات الشخصية' : 'Personal Information' }}
        </h2>
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-input
              [label]="isRtl ? 'الاسم الكامل' : 'Full Name'"
              formControlName="name"
              [required]="true"
              [error]="getNameError()"
            ></app-input>

            <app-input
              [label]="isRtl ? 'البريد الإلكتروني' : 'Email Address'"
              formControlName="email"
              [disabled]="true"
              [helperText]="isRtl ? 'البريد الإلكتروني مرتبط بهويتك ولا يمكن تغييره مباشرة.' : 'Email is tied to your identity and cannot be changed directly.'"
            ></app-input>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-input
              [label]="isRtl ? 'رقم الهاتف' : 'Phone Number'"
              formControlName="phone"
              placeholder="01xxxxxxxxx"
            ></app-input>

            <app-input
              [label]="isRtl ? 'المحافظة / المدينة' : 'City / Governorate'"
              formControlName="city"
              [placeholder]="isRtl ? 'مثال: القاهرة أو الجيزة' : 'e.g. Cairo or Giza'"
            ></app-input>
          </div>

          <app-input
            [label]="isRtl ? 'الحي / المنطقة' : 'Neighborhood / Area'"
            formControlName="area"
            [placeholder]="isRtl ? 'مثال: المعادي، الدقي، مدينة نصر' : 'e.g. Maadi, Dokki, Nasr City'"
          ></app-input>

          <div class="flex justify-end pt-3 border-t border-neutral-100">
            <app-button
              type="submit"
              variant="primary"
              [isLoading]="isSaving()"
              [disabled]="profileForm.pristine || profileForm.invalid"
            >
              {{ isRtl ? 'حفظ التعديلات' : 'Save Changes' }}
            </app-button>
          </div>
        </form>
      </app-card>

      <!-- Security: Change Password Card -->
      <app-card padding="lg">
        <h2 class="text-base font-bold text-neutral-900 mb-1">
          {{ isRtl ? 'الأمان وكلمة المرور' : 'Security & Password' }}
        </h2>
        <p class="text-xs text-neutral-500 mb-4 pb-2 border-b border-neutral-100">
          {{ isRtl
            ? 'تحديث كلمة مرور حسابك. يجب ألا تقل عن 8 خانات.'
            : 'Update your account password. Must be at least 8 characters long.' }}
        </p>

        @if (passwordError()) {
          <div class="p-3 mb-4 rounded-md bg-danger-bg text-danger border border-danger/20 text-xs flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span>{{ passwordError() }}</span>
          </div>
        }

        @if (passwordSuccess()) {
          <div class="p-3 mb-4 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ passwordSuccess() }}</span>
          </div>
        }

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="flex flex-col gap-4">
          <app-input
            [label]="isRtl ? 'كلمة المرور الحالية' : 'Current Password'"
            type="password"
            placeholder="••••••••"
            formControlName="currentPassword"
            [required]="true"
            [error]="getCurrentPasswordError()"
          ></app-input>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-input
              [label]="isRtl ? 'كلمة المرور الجديدة' : 'New Password'"
              type="password"
              placeholder="••••••••"
              formControlName="newPassword"
              [required]="true"
              [error]="getNewPasswordError()"
            ></app-input>

            <app-input
              [label]="isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'"
              type="password"
              placeholder="••••••••"
              formControlName="confirmPassword"
              [required]="true"
              [error]="getConfirmPasswordError()"
            ></app-input>
          </div>

          <div class="flex justify-end pt-3 border-t border-neutral-100">
            <app-button
              type="submit"
              variant="secondary"
              [isLoading]="isChangingPassword()"
              [disabled]="passwordForm.invalid || !newPasswordsMatch()"
            >
              {{ isRtl ? 'تحديث كلمة المرور' : 'Update Password' }}
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  protected languageService = injectLanguageService();
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  readonly isSaving = signal(false);
  readonly isChangingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal<string | null>(null);

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: [{ value: '', disabled: true }],
    phone: [''],
    city: [''],
    area: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.contactInfo?.phone || user.phone || '',
        city: user.address?.city || user.location?.city || '',
        area: user.address?.area || user.location?.area || ''
      });
    }
  }

  getRoleLabel(): string {
    const role = this.authService.userRole();
    if (role === 'admin') return this.isRtl ? 'مشرف النظام' : 'System Admin';
    if (this.authService.isOrganization() || this.authService.currentUser()?.organizationId) {
      return this.isRtl ? 'منظمة أهلية / جمعية' : 'Organization / NGO';
    }
    return this.isRtl ? 'مستخدم فردي' : 'Individual User';
  }

  getNameError(): string | null {
    const control = this.profileForm.get('name');
    if (control?.touched && control.errors) {
      if (control.errors['required']) return this.isRtl ? 'الاسم مطلوب' : 'Name is required';
      if (control.errors['minlength']) return this.isRtl ? 'يجب ألا يقل الاسم عن 3 أحرف' : 'Name must be at least 3 characters';
    }
    return null;
  }

  getCurrentPasswordError(): string | null {
    const control = this.passwordForm.get('currentPassword');
    if (control?.touched && control?.errors?.['required']) {
      return this.isRtl ? 'كلمة المرور الحالية مطلوبة' : 'Current password is required';
    }
    return null;
  }

  getNewPasswordError(): string | null {
    const control = this.passwordForm.get('newPassword');
    if (control?.touched && control.errors) {
      if (control.errors['required']) return this.isRtl ? 'كلمة المرور الجديدة مطلوبة' : 'New password is required';
      if (control.errors['minlength']) return this.isRtl ? 'يجب ألا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters';
    }
    return null;
  }

  getConfirmPasswordError(): string | null {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.touched) {
      if (control?.errors?.['required']) return this.isRtl ? 'يرجى تأكيد كلمة المرور الجديدة' : 'Please confirm your new password';
      if (!this.newPasswordsMatch() && this.passwordForm.get('newPassword')?.value) {
        return this.isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
      }
    }
    return null;
  }

  newPasswordsMatch(): boolean {
    const newPass = this.passwordForm.get('newPassword')?.value;
    const confirm = this.passwordForm.get('confirmPassword')?.value;
    return Boolean(newPass && confirm && newPass === confirm);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const { name, phone, city, area } = this.profileForm.getRawValue();

    this.authService.updateProfile({
      name,
      contactInfo: { phone: phone ? phone.trim() : undefined },
      location: { city, area },
      address: { city, area }
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.profileForm.markAsPristine();
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || !this.newPasswordsMatch()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordSuccess.set(this.isRtl ? 'تم تغيير كلمة المرور بنجاح.' : 'Password has been changed successfully.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.passwordError.set(
          err?.error?.error?.message || err?.error?.message || (this.isRtl ? 'تعذر تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية.' : 'Failed to change password. Please check your current password.')
        );
      }
    });
  }
}


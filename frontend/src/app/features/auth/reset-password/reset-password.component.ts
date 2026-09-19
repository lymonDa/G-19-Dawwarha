import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div class="w-full max-w-md flex flex-col gap-6">
        <!-- Brand Header -->
        <div class="text-center flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-3 border border-primary-100 shadow-sm overflow-hidden text-primary">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">{{ languageService.t().RESET_TITLE }}</h1>
          <p class="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
            {{ languageService.t().RESET_SUBTITLE }}
          </p>
        </div>

        <app-card padding="lg">
          @if (!token()) {
            <!-- Missing Token Notice -->
            <div class="flex flex-col items-center text-center py-4 space-y-4">
              <div class="w-12 h-12 rounded-full bg-danger-bg text-danger border border-danger/20 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="text-sm font-bold text-neutral-900">{{ languageService.currentLanguage() === 'ar' ? 'رابط غير صالح' : 'Invalid Reset Link' }}</h3>
                <p class="text-xs text-neutral-500 leading-relaxed">
                  {{ languageService.t().RESET_INVALID_TOKEN }}
                </p>
              </div>
              <div class="flex flex-col w-full gap-2 pt-2">
                <a
                  routerLink="/forgot-password"
                  class="w-full py-2.5 px-4 bg-primary text-white text-xs font-semibold rounded-lg text-center hover:bg-secondary transition-colors"
                >
                  {{ languageService.t().SEND_RESET_LINK_BTN }}
                </a>
                <a
                  routerLink="/login"
                  class="w-full py-2 text-xs text-neutral-500 text-center hover:text-neutral-800 transition-colors"
                >
                  {{ languageService.t().BACK_TO_LOGIN }}
                </a>
              </div>
            </div>
          } @else if (isSuccess()) {
            <!-- Success State -->
            <div class="flex flex-col items-center text-center py-4 space-y-4">
              <div class="w-14 h-14 rounded-full bg-primary-50 border border-primary-200 text-primary flex items-center justify-center shadow-sm">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-bold text-neutral-900">{{ languageService.t().RESET_SUCCESS_TITLE }}</h3>
                <p class="text-xs text-neutral-500 leading-relaxed max-w-xs">
                  {{ languageService.t().RESET_SUCCESS_DESC }}
                </p>
              </div>
              <div class="w-full pt-2">
                <a
                  routerLink="/login"
                  class="w-full inline-block py-2.5 px-4 bg-primary text-white text-xs font-semibold rounded-lg text-center hover:bg-secondary transition-colors shadow-sm"
                >
                  {{ languageService.t().SIGN_IN_BTN }}
                </a>
              </div>
            </div>
          } @else {
            <!-- Reset Password Form -->
            @if (errorMessage()) {
              <div class="p-3 mb-4 rounded-md bg-danger-bg text-danger border border-danger/20 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <app-input
                [label]="languageService.t().NEW_PASSWORD_LABEL"
                type="password"
                placeholder="••••••••"
                formControlName="password"
                [required]="true"
                [error]="getPasswordError()"
              ></app-input>

              <app-input
                [label]="languageService.t().CONFIRM_PASSWORD_LABEL"
                type="password"
                placeholder="••••••••"
                formControlName="confirmPassword"
                [required]="true"
                [error]="getConfirmPasswordError()"
              ></app-input>

              <!-- Policy Checklist -->
              <div class="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <span class="font-semibold text-neutral-600 block text-[11px] mb-1">
                  {{ languageService.currentLanguage() === 'ar' ? 'متطلبات كلمة المرور:' : 'Password Requirements:' }}
                </span>
                <div class="grid grid-cols-2 gap-1 text-[11px]">
                  <div class="flex items-center gap-1.5" [class.text-primary]="hasMinLength()" [class.text-neutral-400]="!hasMinLength()">
                    <span>{{ hasMinLength() ? '✓' : '○' }}</span>
                    <span>8+ {{ languageService.currentLanguage() === 'ar' ? 'أحرف' : 'characters' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5" [class.text-primary]="hasNumber()" [class.text-neutral-400]="!hasNumber()">
                    <span>{{ hasNumber() ? '✓' : '○' }}</span>
                    <span>{{ languageService.currentLanguage() === 'ar' ? 'رقم واحد على الأقل' : 'At least 1 number' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 col-span-2" [class.text-primary]="passwordsMatch()" [class.text-neutral-400]="!passwordsMatch()">
                    <span>{{ passwordsMatch() ? '✓' : '○' }}</span>
                    <span>{{ languageService.currentLanguage() === 'ar' ? 'كلمتا المرور متطابقتان' : 'Passwords match' }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-2">
                <app-button
                  type="submit"
                  variant="primary"
                  [fullWidth]="true"
                  [isLoading]="isLoading()"
                  [disabled]="resetForm.invalid || !passwordsMatch()"
                >
                  {{ languageService.t().RESET_PASSWORD_BTN }}
                </app-button>
              </div>
            </form>

            <div class="pt-4 mt-2 text-center border-t border-neutral-100">
              <a routerLink="/login" class="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{{ languageService.t().BACK_TO_LOGIN }}</span>
              </a>
            </div>
          }
        </app-card>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  languageService = inject(LanguageService);

  token = signal<string | null>(null);
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  hasMinLength = signal(false);
  hasNumber = signal(false);
  passwordsMatch = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token.set(params['token'] || null);
    });

    this.resetForm.valueChanges.subscribe(val => {
      const pass = val.password || '';
      const confirm = val.confirmPassword || '';
      this.hasMinLength.set(pass.length >= 8);
      this.hasNumber.set(/\d/.test(pass));
      this.passwordsMatch.set(pass.length >= 8 && pass === confirm);
    });
  }

  getPasswordError(): string | null {
    const control = this.resetForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this.languageService.currentLanguage() === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
      if (control.errors['minlength']) return this.languageService.currentLanguage() === 'ar' ? 'يجب أن لا تقل عن 8 أحرف' : 'Must be at least 8 characters';
    }
    return null;
  }

  getConfirmPasswordError(): string | null {
    const control = this.resetForm.get('confirmPassword');
    if (control?.touched) {
      if (control?.errors?.['required']) return this.languageService.currentLanguage() === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Confirm password is required';
      if (!this.passwordsMatch() && this.resetForm.get('password')?.value) {
        return this.languageService.currentLanguage() === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.passwordsMatch() || !this.token()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const newPassword = this.resetForm.value.password;

    this.authService.resetPassword(this.token()!, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error?.message || err.error?.message || 'Failed to reset password. The link may have expired.');
      }
    });
  }
}

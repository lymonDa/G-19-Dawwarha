import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div class="w-full max-w-md flex flex-col gap-6">
        <!-- Brand Header -->
        <div class="text-center flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-3 border border-primary-100 shadow-sm overflow-hidden text-primary">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-xs text-secondary font-medium mb-2 border border-surface-variant">
            <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>15-Min TTL • Zero Enumeration</span>
          </div>
          <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">{{ languageService.t().FORGOT_TITLE }}</h1>
          <p class="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
            {{ languageService.t().FORGOT_SUBTITLE }}
          </p>
        </div>

        <!-- Card Container -->
        <app-card padding="lg">
          @if (isSubmitted()) {
            <!-- State 2: Success Notice -->
            <div class="flex flex-col items-center text-center py-2 space-y-4">
              <div class="w-14 h-14 rounded-full bg-primary-50 border border-primary-200 text-primary flex items-center justify-center shadow-sm">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div class="space-y-1">
                <h3 class="text-base font-bold text-neutral-900">{{ languageService.t().FORGOT_SUCCESS_TITLE }}</h3>
                <p class="text-xs text-neutral-500 leading-relaxed max-w-xs">
                  {{ languageService.t().FORGOT_SUCCESS_DESC }}
                </p>
                <p class="text-xs font-semibold text-primary pt-1">{{ submittedEmail() }}</p>
              </div>

              <!-- Dev / Demo Mode Shortcut Token -->
              @if (demoResetToken()) {
                <div class="w-full p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-start space-y-1.5">
                  <div class="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                    <span>⚡ Demo / Test Mode Active</span>
                    <span class="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">Token Ready</span>
                  </div>
                  <p class="text-[11px] text-emerald-700">
                    A test token was generated. Click below to test password reset directly without SMTP:
                  </p>
                  <a
                    [routerLink]="['/reset-password']"
                    [queryParams]="{ token: demoResetToken() }"
                    class="inline-block w-full text-center py-1.5 px-3 bg-primary text-white text-xs font-semibold rounded shadow-sm hover:bg-secondary transition-colors"
                  >
                    Proceed to Reset Password &rarr;
                  </a>
                </div>
              }

              <div class="flex flex-col w-full gap-2 pt-2">
                <a
                  routerLink="/login"
                  class="w-full py-2.5 px-4 bg-primary text-white text-xs font-medium rounded-lg text-center hover:bg-secondary transition-colors shadow-sm"
                >
                  {{ languageService.t().BACK_TO_LOGIN }}
                </a>
                <button
                  type="button"
                  (click)="resetForm()"
                  class="w-full py-2 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  {{ languageService.t().TRY_ANOTHER_EMAIL }}
                </button>
              </div>
            </div>
          } @else {
            <!-- State 1: Input Form -->
            @if (errorMessage()) {
              <div class="p-3 mb-4 rounded-md bg-danger-bg text-danger border border-danger/20 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <app-input
                [label]="languageService.t().EMAIL_LABEL"
                type="email"
                placeholder="name@example.com"
                formControlName="email"
                [required]="true"
                [error]="getEmailError()"
              ></app-input>

              <div class="pt-2">
                <app-button
                  type="submit"
                  variant="primary"
                  [fullWidth]="true"
                  [isLoading]="isLoading()"
                >
                  {{ languageService.t().SEND_RESET_LINK_BTN }}
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  languageService = inject(LanguageService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isSubmitted = signal(false);
  submittedEmail = signal<string>('');
  demoResetToken = signal<string | null>(null);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  getEmailError(): string | null {
    const control = this.forgotForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this.languageService.currentLanguage() === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      if (control.errors['email']) return this.languageService.currentLanguage() === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Please enter a valid email address';
    }
    return null;
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const email = this.forgotForm.value.email.trim();

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.submittedEmail.set(email);
        this.isSubmitted.set(true);
        if (res.resetToken) {
          this.demoResetToken.set(res.resetToken);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error?.message || err.error?.message || 'Failed to request password reset. Please try again.');
      }
    });
  }

  resetForm(): void {
    this.forgotForm.reset();
    this.isSubmitted.set(false);
    this.errorMessage.set(null);
    this.demoResetToken.set(null);
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div class="w-full max-w-md flex flex-col gap-6">
        <!-- Brand Header -->
        <div class="text-center flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-3 border border-primary-100 shadow-sm overflow-hidden">
            <img src="/assets/logo/logo-mark.png" alt="Dawwarha" class="w-full h-full object-contain p-1" />
          </div>
          <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">{{ languageService.t().LOGIN_TITLE }}</h1>
          <p class="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
            {{ languageService.t().LOGIN_SUBTITLE }}
          </p>
        </div>

        <!-- Login Card -->
        <app-card padding="lg">
          @if (errorMessage()) {
            <div class="p-3 mb-4 rounded-md bg-danger-bg text-danger border border-danger/20 text-xs flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <app-input
              [label]="languageService.t().EMAIL_LABEL"
              type="email"
              placeholder="name@example.com"
              formControlName="email"
              [required]="true"
              [error]="getEmailError()"
            ></app-input>

            <div class="flex flex-col gap-1">
              <app-input
                [label]="languageService.t().PASSWORD_LABEL"
                type="password"
                placeholder="••••••••"
                formControlName="password"
                [required]="true"
                [error]="getPasswordError()"
              ></app-input>

              <div class="flex items-center justify-between mt-1 text-xs">
                <label class="flex items-center gap-1.5 text-neutral-600 cursor-pointer">
                  <input type="checkbox" formControlName="rememberMe" class="rounded border-neutral-300 text-primary focus:ring-primary h-3.5 w-3.5" />
                  <span>{{ languageService.t().REMEMBER_ME }}</span>
                </label>
                <a routerLink="/forgot-password" class="text-primary hover:underline font-medium">{{ languageService.t().FORGOT_PASSWORD }}</a>
              </div>
            </div>

            <div class="pt-2">
              <app-button
                type="submit"
                variant="primary"
                [fullWidth]="true"
                [isLoading]="isLoading()"
              >
                {{ languageService.t().SIGN_IN_BTN }}
              </app-button>
            </div>
          </form>

          <!-- Divider -->
          <div class="relative my-5">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-neutral-200"></div></div>
            <div class="relative flex justify-center text-xs"><span class="px-2 bg-white text-neutral-400">or use a demo account</span></div>
          </div>

          <!-- Quick Seed Testing Shortcut for Demo / Evaluator -->
          <div class="bg-neutral-50 p-3 rounded-md border border-neutral-200 flex flex-col gap-2">
            <span class="text-[11px] font-semibold text-neutral-500">{{ languageService.t().DEMO_ACCOUNTS }}</span>
            <div class="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                (click)="fillDemo('provider@dawwarha.org', 'Password123!')"
                class="px-2 py-1 bg-white border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-700 text-[11px] font-medium cursor-pointer"
              >
                {{ languageService.t().DEMO_PROVIDER }}
              </button>
              <button
                type="button"
                (click)="fillDemo('seeker@dawwarha.org', 'Password123!')"
                class="px-2 py-1 bg-white border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-700 text-[11px] font-medium cursor-pointer"
              >
                {{ languageService.t().DEMO_ORG }}
              </button>
              <button
                type="button"
                (click)="fillDemo('admin@dawwarha.org', 'AdminPassword123!')"
                class="px-2 py-1 bg-neutral-800 text-white rounded hover:bg-neutral-900 text-[11px] font-medium cursor-pointer"
              >
                {{ languageService.t().DEMO_ADMIN }}
              </button>
            </div>
          </div>
        </app-card>

        <!-- Register Link -->
        <p class="text-center text-xs text-neutral-600">
          {{ languageService.t().DONT_HAVE_ACCOUNT }}
          <a routerLink="/register" class="text-primary font-semibold hover:underline ms-1">{{ languageService.t().CREATE_ACCOUNT_LINK }}</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  languageService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true]
  });

  getEmailError(): string | null {
    const control = this.loginForm.get('email');
    if (control?.touched && control.errors) {
      if (control.errors['required']) return this.languageService.currentLanguage() === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      if (control.errors['email']) return this.languageService.currentLanguage() === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
    }
    return null;
  }

  getPasswordError(): string | null {
    const control = this.loginForm.get('password');
    if (control?.touched && control.errors) {
      if (control.errors['required']) return this.languageService.currentLanguage() === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
      if (control.errors['minlength']) return this.languageService.currentLanguage() === 'ar' ? 'يجب ألا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters';
    }
    return null;
  }

  fillDemo(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success(
          this.languageService.currentLanguage() === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully',
          this.languageService.currentLanguage() === 'ar' ? 'أهلاً بك' : 'Welcome'
        );
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.message || (this.languageService.currentLanguage() === 'ar' ? 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.' : 'Invalid credentials. Please check your email and password.')
        );
      }
    });
  }
}

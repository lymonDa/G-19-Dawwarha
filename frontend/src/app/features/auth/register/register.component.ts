import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ToastService } from '../../../core/services/toast.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <div class="w-full max-w-lg flex flex-col gap-6">
        <!-- Brand Header -->
        <div class="text-center flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-3 border border-primary-100 shadow-sm overflow-hidden">
            <img src="/assets/logo/logo-mark.png" alt="Dawwarha" class="w-full h-full object-contain p-1" />
          </div>
          <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Create a Dawwarha Account</h1>
          <p class="text-xs text-neutral-500 mt-1 max-w-sm leading-relaxed">
            Join the civic resource redistribution network — offer surplus or register community needs.
          </p>
        </div>

        <!-- Role Selector Toggle -->
        <div class="grid grid-cols-2 p-1 bg-neutral-200/70 rounded-xl border border-neutral-300/60">
          <button
            type="button"
            (click)="selectRole('user')"
            class="py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            [class.bg-white]="selectedRole() === 'user'"
            [class.text-neutral-900]="selectedRole() === 'user'"
            [class.shadow-sm]="selectedRole() === 'user'"
            [class.text-neutral-600]="selectedRole() !== 'user'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Individual (Donor / Seeker)</span>
          </button>

          <button
            type="button"
            (click)="selectRole('organization')"
            class="py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            [class.bg-white]="selectedRole() === 'organization'"
            [class.text-neutral-900]="selectedRole() === 'organization'"
            [class.shadow-sm]="selectedRole() === 'organization'"
            [class.text-neutral-600]="selectedRole() !== 'organization'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Civil Organization / NGO</span>
          </button>
        </div>

        <!-- Registration Form Card -->
        <app-card padding="lg">
          @if (errorMessage()) {
            <div class="p-3 mb-4 rounded-md bg-danger-bg text-danger border border-danger/20 text-xs flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <app-input
              [label]="selectedRole() === 'organization' ? 'Organization Representative Name' : 'Full Name'"
              placeholder="e.g. Ahmed Mohammed"
              formControlName="name"
              [required]="true"
              [error]="getFieldError('name')"
            ></app-input>

            <app-input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              formControlName="email"
              [required]="true"
              [error]="getFieldError('email')"
            ></app-input>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <app-input
                label="Phone Number"
                type="tel"
                placeholder="01xxxxxxxxx"
                formControlName="phone"
                [error]="getFieldError('phone')"
              ></app-input>

              <app-input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                formControlName="password"
                [required]="true"
                [error]="getFieldError('password')"
              ></app-input>
            </div>

            <div class="pt-2">
              <app-button
                type="submit"
                variant="primary"
                [fullWidth]="true"
                [isLoading]="isLoading()"
              >
                Create Account
              </app-button>
            </div>
          </form>
        </app-card>

        <p class="text-center text-xs text-neutral-600">
          Already have an account?
          <a routerLink="/login" class="text-primary font-semibold hover:underline ms-1">Sign In</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedRole = signal<UserRole>('user');

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['']
  });

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  getFieldError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);
    if (control?.touched && control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['minlength']) return `Must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = {
      ...this.registerForm.value,
      role: this.selectedRole()
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Account created successfully — welcome to Dawwarha!');
        if (this.selectedRole() === 'organization') {
          this.router.navigate(['/organizations/register']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || 'Registration failed. Please check your details and try again.');
      }
    });
  }
}

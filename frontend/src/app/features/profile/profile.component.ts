import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent],
  template: `
    <div class="max-w-3xl mx-auto flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">My Profile</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Manage your account information and security settings.</p>
        </div>
        <app-badge [variant]="authService.isAdmin() ? 'danger' : (authService.isOrganization() ? 'sand' : 'neutral')">
          {{ getRoleLabel() }}
        </app-badge>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-card padding="md" variant="bordered">
          <span class="text-xs text-neutral-500">Total Contributions</span>
          <p class="text-2xl font-bold text-primary mt-1">
            {{ authService.currentUser()?.stats?.contributionsCount || authService.currentUser()?.stats?.completedTransfers || 0 }}
          </p>
        </app-card>

        <app-card padding="md" variant="bordered">
          <span class="text-xs text-neutral-500">Successful Handovers</span>
          <p class="text-2xl font-bold text-neutral-900 mt-1">
            {{ authService.currentUser()?.stats?.successfulTransfers || 0 }}
          </p>
        </app-card>

        <app-card padding="md" variant="bordered">
          <span class="text-xs text-neutral-500">Reliability Rating</span>
          <p class="text-2xl font-bold text-success mt-1">
            {{ authService.currentUser()?.stats?.reputationScore ? (authService.currentUser()?.stats?.reputationScore! / 20).toFixed(1) : '5.0' }} / 5
          </p>
        </app-card>
      </div>

      <!-- Profile Edit Form -->
      <app-card padding="lg">
        <h2 class="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">Personal Information</h2>
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-input
              label="Full Name"
              formControlName="name"
              [required]="true"
              [error]="getNameError()"
            ></app-input>

            <app-input
              label="Email Address"
              formControlName="email"
              [disabled]="true"
              helperText="Email is tied to your identity and cannot be changed directly."
            ></app-input>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-input
              label="Phone Number"
              formControlName="phone"
              placeholder="01xxxxxxxxx"
            ></app-input>

            <app-input
              label="City / Governorate"
              formControlName="city"
              placeholder="e.g. Cairo or Giza"
            ></app-input>
          </div>

          <app-input
            label="Neighborhood / Area"
            formControlName="area"
            placeholder="e.g. Maadi, Dokki, Nasr City"
          ></app-input>

          <div class="flex justify-end pt-3 border-t border-neutral-100">
            <app-button
              type="submit"
              variant="primary"
              [isLoading]="isSaving()"
              [disabled]="profileForm.pristine || profileForm.invalid"
            >
              Save Changes
            </app-button>
          </div>
        </form>
      </app-card>

      <!-- Security: Change Password Card -->
      <app-card padding="lg">
        <h2 class="text-base font-bold text-neutral-900 mb-1">Security &amp; Password</h2>
        <p class="text-xs text-neutral-500 mb-4 pb-2 border-b border-neutral-100">
          Update your account password. Must be at least 8 characters long.
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
            label="Current Password"
            type="password"
            placeholder="••••••••"
            formControlName="currentPassword"
            [required]="true"
            [error]="getCurrentPasswordError()"
          ></app-input>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-input
              label="New Password"
              type="password"
              placeholder="••••••••"
              formControlName="newPassword"
              [required]="true"
              [error]="getNewPasswordError()"
            ></app-input>

            <app-input
              label="Confirm New Password"
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
              Update Password
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  readonly isSaving = signal(false);
  readonly isChangingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal<string | null>(null);

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
    if (role === 'admin') return 'System Admin';
    if (this.authService.isOrganization() || this.authService.currentUser()?.organizationId) return 'Organization / NGO';
    return 'Individual User';
  }

  getNameError(): string | null {
    const control = this.profileForm.get('name');
    if (control?.touched && control.errors) {
      if (control.errors['required']) return 'Name is required';
      if (control.errors['minlength']) return 'Name must be at least 3 characters';
    }
    return null;
  }

  getCurrentPasswordError(): string | null {
    const control = this.passwordForm.get('currentPassword');
    if (control?.touched && control?.errors?.['required']) {
      return 'Current password is required';
    }
    return null;
  }

  getNewPasswordError(): string | null {
    const control = this.passwordForm.get('newPassword');
    if (control?.touched && control.errors) {
      if (control.errors['required']) return 'New password is required';
      if (control.errors['minlength']) return 'Password must be at least 8 characters';
    }
    return null;
  }

  getConfirmPasswordError(): string | null {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.touched) {
      if (control?.errors?.['required']) return 'Please confirm your new password';
      if (!this.newPasswordsMatch() && this.passwordForm.get('newPassword')?.value) {
        return 'Passwords do not match';
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
        this.passwordSuccess.set('Password has been changed successfully.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.passwordError.set(err?.error?.error?.message || err?.error?.message || 'Failed to change password. Please check your current password.');
      }
    });
  }
}

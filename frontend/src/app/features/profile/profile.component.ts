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
          <p class="text-xs text-neutral-500 mt-0.5">Manage your account information and contact details.</p>
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
            {{ authService.currentUser()?.stats?.contributionsCount || 0 }}
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
            {{ authService.currentUser()?.stats?.rating || 5.0 }} / 5
          </p>
        </app-card>
      </div>

      <!-- Profile Edit Form -->
      <app-card padding="lg">
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
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  readonly isSaving = signal(false);

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: [{ value: '', disabled: true }],
    phone: [''],
    city: [''],
    area: ['']
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
    if (role === 'organization') return 'Organization / NGO';
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

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const { name, phone, city, area } = this.profileForm.getRawValue();

    this.authService.updateProfile({
      name,
      contactInfo: { phone },
      location: { city, area },
      address: { city, area }
    } as any).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.profileForm.markAsPristine();
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }
}

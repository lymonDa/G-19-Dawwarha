import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiBaseService } from '../../../core/services/api-base.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { OrganizationType } from '../../../core/models/organization.model';

@Component({
  selector: 'app-org-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="max-w-2xl mx-auto py-8">
      <div class="flex flex-col gap-6">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Register a Civil Organization</h1>
          <p class="text-xs text-neutral-500 mt-1">
            Register your organization to request resources on its behalf, post periodic needs lists, and get verified on the platform.
          </p>
        </div>

        <app-card padding="lg">
          <form [formGroup]="orgForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <app-input
              label="Organization Name"
              placeholder="e.g. Al-Amal Association for Orphan Care"
              formControlName="name"
              [required]="true"
              [error]="getFieldError('name')"
            ></app-input>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-neutral-900">
                Organization Type <span class="text-danger">*</span>
              </label>
              <select
                formControlName="type"
                class="w-full px-3.5 py-2.5 bg-white text-neutral-900 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ngo">Non-Governmental Organization (NGO)</option>
                <option value="charity">Charitable Association</option>
                <option value="community_group">Community / Youth Initiative</option>
                <option value="educational">Educational Institution</option>
                <option value="other">Other</option>
              </select>
            </div>

            <app-input
              label="Official Registration / License Number (if applicable)"
              placeholder="Ministry of Social Solidarity registration number"
              formControlName="registrationNumber"
            ></app-input>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-neutral-900">About the Organization's Activities</label>
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Write a brief description of your development or humanitarian focus..."
                class="w-full px-3.5 py-2.5 bg-white text-neutral-900 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>

            <!-- Contact Fields -->
            <div class="pt-2 border-t border-neutral-100 flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-neutral-900">Contact & Location Details</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-input
                  label="Official Organization Email"
                  type="email"
                  formControlName="email"
                  [required]="true"
                  [error]="getFieldError('email')"
                ></app-input>

                <app-input
                  label="Office / Contact Phone"
                  type="tel"
                  formControlName="phone"
                  [required]="true"
                  [error]="getFieldError('phone')"
                ></app-input>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-input
                  label="Governorate"
                  placeholder="e.g. Cairo or Giza"
                  formControlName="city"
                  [required]="true"
                  [error]="getFieldError('city')"
                ></app-input>

                <app-input
                  label="Office Address"
                  placeholder="Street, building number, neighborhood"
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
                Submit Registration Request
              </app-button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `
})
export class OrgRegisterComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiBaseService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);

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
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Invalid email format';
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

    this.api.post<{ success: boolean; data: any }>('/organizations', payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Organization registered successfully — your profile is under review.', 'Registered');
        this.router.navigate(['/organizations/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error(err?.message || 'Could not complete organization registration.');
      }
    });
  }
}

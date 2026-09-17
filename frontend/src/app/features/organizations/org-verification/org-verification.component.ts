import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-org-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent, BadgeComponent],
  template: `
    <div class="max-w-3xl mx-auto flex flex-col gap-6 py-4">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Account Verification & Official Accreditation</h1>
        <p class="text-xs text-neutral-500 mt-1">
          Verifying organizations ensures the legitimacy of beneficiary entities and grants the green Verified Badge to the organization.
        </p>
      </div>

      <!-- Current Verification Status Card -->
      <app-card padding="md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <span class="text-xs text-neutral-500">Current Accreditation Status</span>
              <p class="text-sm font-bold text-neutral-900 mt-0.5">Verification Request Under Technical Review</p>
            </div>
          </div>
          <app-badge variant="warning">Under Review</app-badge>
        </div>
      </app-card>

      <!-- Document Submission Form -->
      <app-card padding="lg">
        <h3 class="text-base font-semibold text-neutral-900 mb-2">Submit Official Documents & Data</h3>
        <p class="text-xs text-neutral-600 mb-6 leading-relaxed">
          Please attach the registration certificate issued by the Ministry of Social Solidarity, or proof of official organization registration, along with the representative's information.
        </p>

        <form [formGroup]="verificationForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <app-input
            label="Official Registration Number"
            placeholder="e.g. No. 1420 for 2018"
            formControlName="regNumber"
            [required]="true"
          ></app-input>

          <app-input
            label="Document Link (PDF or certified image)"
            placeholder="https://..."
            formControlName="docUrl"
            [required]="true"
            helperText="Upload the document to a cloud storage link or provide a direct URL."
          ></app-input>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-neutral-900">Additional Notes for Admins</label>
            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Any additional information you'd like to clarify..."
              class="w-full px-3.5 py-2.5 bg-white text-neutral-900 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          <div class="pt-4 flex justify-end">
            <app-button
              type="submit"
              variant="primary"
              [isLoading]="isSubmitting()"
            >
              Submit Documents for Review
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `
})
export class OrgVerificationComponent {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  readonly isSubmitting = signal(false);

  verificationForm: FormGroup = this.fb.group({
    regNumber: ['', Validators.required],
    docUrl: ['', Validators.required],
    notes: ['']
  });

  onSubmit(): void {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toast.success('Verification documents submitted successfully. An admin will review them shortly.', 'Submitted');
    }, 800);
  }
}

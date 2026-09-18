import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { CategorySelectorComponent } from '../../../shared/components/category-selector/category-selector.component';
import { RequestPayload } from '../../../core/models/request.model';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CategorySelectorComponent
  ],
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css']
})
export class RequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(RequestApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = false;
  requestId = '';
  loading = false;
  saving = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    categoryId: ['', [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    urgency: ['medium', [Validators.required]],
    location: this.fb.group({
      city: ['', [Validators.required]],
      area: ['']
    }),
    description: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.requestId;

    if (this.isEdit) {
      this.loadExistingRequest();
    }
  }

  loadExistingRequest(): void {
    this.loading = true;
    this.api.getById(this.requestId).subscribe({
      next: (req) => {
        const catId = typeof req.categoryId === 'object'
          ? req.categoryId?._id || req.categoryId?.id
          : req.categoryId;

        this.form.patchValue({
          categoryId: catId || '',
          quantity: req.quantity || 1,
          urgency: req.urgency || 'medium',
          location: {
            city: req.location?.city || '',
            area: req.location?.area || ''
          },
          description: req.description || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load request for editing.';
      }
    });
  }

  // Helper getters for validation display
  isFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  isLocationFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(`location.${name}`);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();
    const payload: RequestPayload = {
      categoryId: raw.categoryId,
      quantity: Number(raw.quantity),
      urgency: raw.urgency,
      location: {
        city: raw.location.city.trim(),
        area: (raw.location.area || '').trim()
      },
      description: (raw.description || '').trim()
    };

    const action$ = this.isEdit
      ? this.api.update(this.requestId, payload)
      : this.api.create(payload);

    action$.subscribe({
      next: (createdOrUpdated) => {
        this.saving = false;
        const targetId = createdOrUpdated?._id || createdOrUpdated?.id || this.requestId;
        if (targetId) {
          this.router.navigate(['/requests', targetId]);
        } else {
          this.router.navigate(['/requests']);
        }
      },
      error: (err) => {
        this.saving = false;
        if (err.status === 409) {
          this.errorMessage = 'A conflicting request already exists or cannot be modified in its current state.';
        } else if (err.status === 403) {
          this.errorMessage = 'You do not have permission to perform this action.';
        } else {
          this.errorMessage = err?.error?.error?.message || err?.error?.message || 'An error occurred while saving the request.';
        }
      }
    });
  }
}
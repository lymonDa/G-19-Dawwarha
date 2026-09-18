import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizationApiService } from '../organization-api.service';
import { Organization } from '../../../core/models/organization.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { VerificationBadgeComponent } from '../../../shared/components/verification-badge/verification-badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-org-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, VerificationBadgeComponent, SkeletonComponent],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      @if (isLoading()) {
        <app-skeleton variant="card"></app-skeleton>
      } @else if (org()) {
        <!-- Org Header Card -->
        <app-card padding="lg">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-primary-50 text-primary font-bold flex items-center justify-center text-2xl border border-primary-100">
                {{ org()?.name?.charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold text-neutral-900">{{ org()?.name }}</h1>
                  @if (isVerified) {
                    <app-verification-badge status="verified"></app-verification-badge>
                  }
                </div>
                <p class="text-xs text-neutral-500 mt-1">
                  {{ contactCity }} · Registered Civil Organization
                </p>
              </div>
            </div>

            <a routerLink="/requests">
              <app-button variant="outline" size="sm">
                Browse This Organization's Requests
              </app-button>
            </a>
          </div>

          <!-- Description -->
          @if (org()?.description) {
            <div class="mt-6 pt-6 border-t border-neutral-100">
              <h3 class="text-sm font-semibold text-neutral-900 mb-2">About the Organization</h3>
              <p class="text-xs text-neutral-700 leading-relaxed max-w-3xl">
                {{ org()?.description }}
              </p>
            </div>
          }

          <!-- Contact Details -->
          <div class="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600">
            <div>
              <span class="text-neutral-400 block mb-0.5">Official Contact Email:</span>
              <span class="font-medium text-neutral-900">{{ contactEmail || 'Not specified' }}</span>
            </div>
            <div>
              <span class="text-neutral-400 block mb-0.5">Phone Number:</span>
              <span class="font-medium text-neutral-900">{{ contactPhone || 'Not specified' }}</span>
            </div>
            <div>
              <span class="text-neutral-400 block mb-0.5">Office Address:</span>
              <span class="font-medium text-neutral-900">{{ contactAddress || 'Not specified' }}</span>
            </div>
          </div>
        </app-card>
      } @else {
        <app-card padding="lg">
          <p class="text-center text-sm text-neutral-500 py-8">Organization data not found.</p>
        </app-card>
      }
    </div>
  `
})
export class OrgProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orgApi = inject(OrganizationApiService);

  readonly org = signal<Organization | null>(null);
  readonly isLoading = signal(true);

  get isVerified(): boolean {
    return this.org()?.verificationStatus === 'verified';
  }

  get contactEmail(): string {
    return this.org()?.contact?.email || '';
  }

  get contactPhone(): string {
    return this.org()?.contact?.phone || '';
  }

  get contactCity(): string {
    return this.org()?.contact?.city || '';
  }

  get contactAddress(): string {
    return this.org()?.contact?.address || '';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orgApi.getOrganizationById(id).subscribe({
        next: (organization) => {
          this.org.set(organization);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }
}

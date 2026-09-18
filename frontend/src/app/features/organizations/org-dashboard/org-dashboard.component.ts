import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizationApiService } from '../organization-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Organization } from '../../../core/models/organization.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { VerificationBadgeComponent } from '../../../shared/components/verification-badge/verification-badge.component';
import { ImpactCardComponent } from '../../../shared/components/impact-card/impact-card.component';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, VerificationBadgeComponent, ImpactCardComponent],
  template: `
    <div class="max-w-5xl mx-auto flex flex-col gap-6 py-4">
      <!-- Organization Header & Verification Status -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-card border border-neutral-200 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-primary-50 text-primary font-bold flex items-center justify-center text-xl border border-primary-100">
            {{ org()?.name?.charAt(0) || 'O' }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-neutral-900">{{ org()?.name || 'Organization Dashboard' }}</h1>
              <app-verification-badge [status]="org()?.verificationStatus || 'pending'"></app-verification-badge>
            </div>
            <p class="text-xs text-neutral-500 mt-0.5">
              {{ org()?.contact?.city || 'Cairo' }} · Main Office
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a routerLink="/organizations/verification">
            <app-button variant="secondary" size="sm">
              Manage Verification Documents
            </app-button>
          </a>
          <a routerLink="/requests/create">
            <app-button variant="primary" size="sm">
              + New Demand Request
            </app-button>
          </a>
        </div>
      </div>

      <!-- Verification Alert if Pending -->
      @if (org()?.verificationStatus !== 'verified') {
        <div class="p-4 rounded-card bg-warning-bg border border-warning/30 flex items-start gap-3">
          <svg class="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1 text-xs text-neutral-800 leading-relaxed">
            <p class="font-bold text-neutral-900 mb-0.5">Organization account is pending verification</p>
            <p>
              You can browse resources and requests, but publishing permanent requests and accessing priority matches requires official document approval by the platform admins.
            </p>
          </div>
          <a routerLink="/organizations/verification" class="text-xs font-bold text-warning hover:underline whitespace-nowrap">
            Complete Verification →
          </a>
        </div>
      }

      <!-- KPI Overview (Warm Sand Organization Impact Cards per DESIGN.md §4 & §13) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-impact-card
          [value]="org()?.stats?.requestsFulfilled || 0"
          label="Active Organization Requests"
          description="Covering beneficiary needs"
          variant="organization"
          icon="📋"
        ></app-impact-card>

        <app-impact-card
          [value]="org()?.stats?.resourcesShared || 0"
          label="Successfully Received Resources"
          description="Via dual-confirmed handover"
          variant="organization"
          icon="📦"
        ></app-impact-card>

        <app-impact-card
          [value]="(org()?.stats?.resourcesShared || 0) + (org()?.stats?.requestsFulfilled || 0)"
          label="Total Verified Transfers"
          description="Committed to equitable distribution"
          variant="organization"
          icon="★"
        ></app-impact-card>
      </div>

      <!-- Quick Operational Action Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <app-card padding="md">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-neutral-900 text-sm">Recent Organization Requests</h3>
            <a routerLink="/requests/mine" class="text-xs text-primary hover:underline">View All</a>
          </div>
          <p class="text-xs text-neutral-500 mb-4">
            Track the lifecycle of requests created under your organization and their available matches.
          </p>
          <a routerLink="/requests/create">
            <app-button variant="secondary" size="sm" [fullWidth]="true">
              + Add Urgent Demand Request
            </app-button>
          </a>
        </app-card>

        <app-card padding="md">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-neutral-900 text-sm">Matches & Handover Operations</h3>
            <a routerLink="/matches" class="text-xs text-primary hover:underline">View Matches</a>
          </div>
          <p class="text-xs text-neutral-500 mb-4">
            Confirm resource deliveries to your organization's office via the Two-Sided Handover protocol.
          </p>
          <a routerLink="/matches">
            <app-button variant="outline" size="sm" [fullWidth]="true">
              Review Geographic Matches
            </app-button>
          </a>
        </app-card>
      </div>
    </div>
  `
})
export class OrgDashboardComponent implements OnInit {
  private orgApi = inject(OrganizationApiService);
  authService = inject(AuthService);

  readonly org = signal<Organization | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    const orgId = this.authService.currentUser()?.organizationId;
    const request$ = orgId ? this.orgApi.getOrganizationById(orgId) : this.orgApi.getMyOrganization();

    request$.subscribe({
      next: (organization) => {
        this.org.set(organization);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}

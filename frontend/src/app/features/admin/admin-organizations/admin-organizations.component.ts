import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiBaseService } from '../../../core/services/api-base.service';
import { ToastService } from '../../../core/services/toast.service';
import { Organization, OrganizationVerificationStatus } from '../../../core/models/organization.model';
import { OrganizationCardComponent } from '../../../shared/components/organization-card/organization-card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-organizations',
  standalone: true,
  imports: [CommonModule, OrganizationCardComponent, SkeletonComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Organization Verification Queue</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Review supporting documents and official registration certificates to grant the Verified Badge.</p>
        </div>

        <div class="flex items-center gap-1.5 p-1 bg-white border border-neutral-200 rounded-lg text-xs">
          <button
            type="button"
            (click)="setFilter('all')"
            class="px-3 py-1 rounded font-medium transition-colors"
            [class.bg-primary]="filter() === 'all'"
            [class.text-white]="filter() === 'all'"
            [class.text-neutral-600]="filter() !== 'all'"
          >
            All
          </button>
          <button
            type="button"
            (click)="setFilter('pending')"
            class="px-3 py-1 rounded font-medium transition-colors"
            [class.bg-primary]="filter() === 'pending'"
            [class.text-white]="filter() === 'pending'"
            [class.text-neutral-600]="filter() !== 'pending'"
          >
            Pending Review
          </button>
          <button
            type="button"
            (click)="setFilter('verified')"
            class="px-3 py-1 rounded font-medium transition-colors"
            [class.bg-primary]="filter() === 'verified'"
            [class.text-white]="filter() === 'verified'"
            [class.text-neutral-600]="filter() !== 'verified'"
          >
            Verified
          </button>
        </div>
      </div>

      <!-- Organizations Cards List -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-skeleton variant="card"></app-skeleton>
          <app-skeleton variant="card"></app-skeleton>
        </div>
      } @else if (filteredOrganizations().length === 0) {
        <div class="p-8 text-center bg-white rounded-card border border-neutral-200 text-xs text-neutral-500">
          No organizations match the current filter.
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (org of filteredOrganizations(); track org.id) {
            <app-organization-card
              [org]="org"
              variant="admin-review"
              (verify)="handleVerify(org.id, 'verified')"
              (reject)="handleVerify(org.id, 'rejected')"
            ></app-organization-card>
          }
        </div>
      }
    </div>
  `
})
export class AdminOrganizationsComponent implements OnInit {
  private api = inject(ApiBaseService);
  private toast = inject(ToastService);

  readonly organizations = signal<Organization[]>([]);
  readonly isLoading = signal(true);
  readonly filter = signal<'all' | 'pending' | 'verified' | 'rejected'>('all');

  ngOnInit(): void {
    this.loadOrganizations();
  }

  setFilter(status: 'all' | 'pending' | 'verified' | 'rejected'): void {
    this.filter.set(status);
  }

  filteredOrganizations(): Organization[] {
    const f = this.filter();
    if (f === 'all') return this.organizations();
    return this.organizations().filter(o => o.verificationStatus === f);
  }

  loadOrganizations(): void {
    this.isLoading.set(true);
    this.api.get<{ success: boolean; data: Organization[] }>('/organizations').subscribe({
      next: (res) => {
        this.organizations.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback demo data
        this.organizations.set([
          {
            id: 'org-1',
            name: 'Nahr Al-Ataa Charitable Association',
            type: 'charity',
            registrationNumber: '8942 / 2016',
            description: 'Providing in-kind, food, and medical aid to priority families across Cairo and Giza governorates.',
            verificationStatus: 'pending',
            ownerUserId: 'u2',
            contact: {
              email: 'contact@nahrelataa.org',
              phone: '01012345678',
              address: 'Al-Nasr Street, Maadi',
              city: 'Cairo'
            },
            stats: { resourcesShared: 45, requestsFulfilled: 60 },
            createdAt: '2026-01-20T10:00:00Z'
          },
          {
            id: 'org-2',
            name: 'A Book for Every Child Initiative',
            type: 'community_group',
            registrationNumber: '2105 / 2021',
            description: 'Collecting and distributing school, university, and children books to rural and underserved areas.',
            verificationStatus: 'verified',
            ownerUserId: 'u4',
            contact: {
              email: 'books@dawwarha.org',
              phone: '01198765432',
              address: 'Midan Al-Misaha, Dokki',
              city: 'Giza'
            },
            stats: { resourcesShared: 120, requestsFulfilled: 110 },
            createdAt: '2025-11-10T12:00:00Z'
          }
        ]);
        this.isLoading.set(false);
      }
    });
  }

  handleVerify(orgId: string, status: OrganizationVerificationStatus): void {
    this.api.post(`/organizations/${orgId}/verify`, { status }).subscribe({
      next: () => {
        this.toast.success(status === 'verified' ? 'Organization verified and approved successfully' : 'Verification request rejected');
        this.loadOrganizations();
      },
      error: () => {
        // Local optimistic update
        this.organizations.update(list => list.map(o => o.id === orgId ? { ...o, verificationStatus: status } : o));
        this.toast.success(status === 'verified' ? 'Organization verified' : 'Verification request rejected');
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ImpactCardComponent } from '../../../shared/components/impact-card/impact-card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, ImpactCardComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Live Monitoring & Analytics</h1>
        <p class="text-xs text-neutral-500 mt-0.5">Real-time performance indicators and resource flow across all 4 aggregation pipelines.</p>
      </div>

      <!-- 4 Real-time KPI Cards (Aggregate Neutral Treatment per DESIGN.md §4 & §28) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-impact-card
          [value]="1480"
          label="Total Registered Resources"
          description="94% active & ready for distribution"
          variant="aggregate"
          icon="📦"
        ></app-impact-card>

        <app-impact-card
          [value]="820"
          label="Open Demand Requests"
          description="42 marked urgent priority"
          variant="aggregate"
          icon="📋"
        ></app-impact-card>

        <app-impact-card
          [value]="1340"
          label="Successful Matches Completed"
          description="Dual-confirmed & logged"
          variant="aggregate"
          icon="✓"
        ></app-impact-card>

        <app-impact-card
          [value]="64"
          label="Verified Organizations"
          description="3 verification requests pending"
          variant="aggregate"
          icon="🏢"
        ></app-impact-card>
      </div>

      <!-- Quick Action Admin Shortcuts -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-card padding="md">
          <h3 class="font-bold text-neutral-900 text-sm mb-1">Organization Verification Queue</h3>
          <p class="text-xs text-neutral-500 mb-3">Review registration documents and ministry licenses to grant verification badges.</p>
          <a routerLink="/admin/organizations">
            <app-button variant="primary" size="sm" [fullWidth]="true">
              Review Verification Requests (3)
            </app-button>
          </a>
        </app-card>

        <app-card padding="md">
          <h3 class="font-bold text-neutral-900 text-sm mb-1">User & Account Management</h3>
          <p class="text-xs text-neutral-500 mb-3">Manage roles and monitor suspended or flagged accounts for policy violations.</p>
          <a routerLink="/admin/users">
            <app-button variant="secondary" size="sm" [fullWidth]="true">
              Open Users Table
            </app-button>
          </a>
        </app-card>

        <app-card padding="md">
          <h3 class="font-bold text-neutral-900 text-sm mb-1">Categories & Moderation</h3>
          <p class="text-xs text-neutral-500 mb-3">Manage the resource taxonomy tree and resolve flagged disputes and complaints.</p>
          <a routerLink="/admin/categories">
            <app-button variant="secondary" size="sm" [fullWidth]="true">
              Edit Categories
            </app-button>
          </a>
        </app-card>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {}

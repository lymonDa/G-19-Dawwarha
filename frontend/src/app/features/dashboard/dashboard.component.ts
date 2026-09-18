import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ImpactCardComponent } from '../../shared/components/impact-card/impact-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, BadgeComponent, ImpactCardComponent],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Welcome Hero Banner -->
      <div class="p-6 rounded-card bg-gradient-to-r from-primary-900 to-primary-700 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
              {{ authService.userRole() === 'organization' ? 'Verified Organization Account' : 'User Account' }}
            </span>
            <span class="text-xs text-primary-100">Active Now</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">
            Welcome back, {{ authService.currentUser()?.name }}!
          </h1>
          <p class="text-xs text-primary-100 max-w-xl leading-relaxed">
            From your dashboard you can manage surplus resources, review smart match suggestions, and confirm handovers with your partners.
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <a routerLink="/resources/create">
            <app-button variant="secondary" size="sm">
              + List a Resource
            </app-button>
          </a>
          <a routerLink="/requests/create">
            <app-button variant="primary" size="sm">
              + Post a Request
            </app-button>
          </a>
        </div>
      </div>

      <!-- KPI Metrics Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-500 font-medium">Listed Resources</span>
            <span class="w-2 h-2 rounded-full bg-primary"></span>
          </div>
          <p class="text-3xl font-bold text-neutral-900 mt-2">
            {{ authService.currentUser()?.stats?.contributionsCount || 0 }}
          </p>
          <a routerLink="/resources/mine" class="text-xs text-primary font-medium hover:underline mt-2 block">
            Manage Resources →
          </a>
        </app-card>

        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-500 font-medium">Active Requests</span>
            <span class="w-2 h-2 rounded-full bg-info"></span>
          </div>
          <p class="text-3xl font-bold text-neutral-900 mt-2">
            {{ authService.currentUser()?.stats?.requestsCount || 0 }}
          </p>
          <a routerLink="/requests/mine" class="text-xs text-primary font-medium hover:underline mt-2 block">
            Manage Requests →
          </a>
        </app-card>

        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-500 font-medium">Smart Matches</span>
            <app-badge variant="success" size="sm">Active</app-badge>
          </div>
          <p class="text-3xl font-bold text-success mt-2">
            {{ authService.currentUser()?.stats?.matchesCount || 0 }}
          </p>
          <a routerLink="/matches" class="text-xs text-success font-medium hover:underline mt-2 block">
            Review Matches Now →
          </a>
        </app-card>

        <div class="flex flex-col">
          <app-impact-card
            [value]="authService.currentUser()?.stats?.successfulTransfers || 0"
            label="Community Impact"
            description="Verified completed transfers"
            variant="personal"
            icon="★"
          ></app-impact-card>
          <a routerLink="/contributions" class="text-xs text-sand-700 font-medium hover:underline mt-1.5 block text-end px-1">
            View Contribution History →
          </a>
        </div>
      </div>

      <!-- Quick Discovery & Navigation Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <app-card padding="lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-neutral-900 text-base">Resources Near Your Area</h3>
            <a routerLink="/resources" class="text-xs text-primary hover:underline font-medium">Browse Directory</a>
          </div>
          <p class="text-xs text-neutral-600 mb-5 leading-relaxed">
            Explore the latest devices, supplies, and food items currently listed by nearby donors and organizations.
          </p>
          <a routerLink="/resources">
            <app-button variant="outline" size="sm" [fullWidth]="true">
              Explore All Available Resources
            </app-button>
          </a>
        </app-card>

        <app-card padding="lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-neutral-900 text-base">Urgent Community Needs</h3>
            <a routerLink="/requests" class="text-xs text-primary hover:underline font-medium">Browse Requests</a>
          </div>
          <p class="text-xs text-neutral-600 mb-5 leading-relaxed">
            View requests from charities and initiatives supporting priority families and communities.
          </p>
          <a routerLink="/requests">
            <app-button variant="secondary" size="sm" [fullWidth]="true">
              Browse Demand Requests
            </app-button>
          </a>
        </app-card>
      </div>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
}

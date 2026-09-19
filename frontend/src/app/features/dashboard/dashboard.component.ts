import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { ResourceApiService } from '../resources/resource-api.service';
import { RequestApiService } from '../requests/services/request-api.service';
import { MatchApiService } from '../matches/services/match-api.service';
import { ContributionApiService } from '../contributions/contribution-api.service';

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
              {{ (authService.isOrganization() || authService.currentUser()?.organizationId) ? 'Verified Organization Account' : 'User Account' }}
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

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
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

      <!-- KPI Metrics Row (Live Counts) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-500 font-medium">Listed Resources</span>
            <span class="w-2 h-2 rounded-full bg-primary"></span>
          </div>
          <p class="text-3xl font-bold text-neutral-900 mt-2">
            @if (isLoadingStats()) {
              <span class="text-neutral-300 animate-pulse text-2xl font-normal">--</span>
            } @else {
              {{ resourcesCount() }}
            }
          </p>
          <a routerLink="/resources/mine" class="text-xs text-primary font-medium hover:underline mt-2 inline-flex items-center gap-1">
            <span>Manage Resources</span>
            <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </a>
        </app-card>

        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-500 font-medium">Active Requests</span>
            <span class="w-2 h-2 rounded-full bg-info"></span>
          </div>
          <p class="text-3xl font-bold text-neutral-900 mt-2">
            @if (isLoadingStats()) {
              <span class="text-neutral-300 animate-pulse text-2xl font-normal">--</span>
            } @else {
              {{ requestsCount() }}
            }
          </p>
          <a routerLink="/requests/mine" class="text-xs text-primary font-medium hover:underline mt-2 inline-flex items-center gap-1">
            <span>Manage Requests</span>
            <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </a>
        </app-card>

        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-500 font-medium">Smart Matches</span>
            <app-badge variant="success" size="sm">Active</app-badge>
          </div>
          <p class="text-3xl font-bold text-success mt-2">
            @if (isLoadingStats()) {
              <span class="text-neutral-300 animate-pulse text-2xl font-normal">--</span>
            } @else {
              {{ matchesCount() }}
            }
          </p>
          <a routerLink="/matches" class="text-xs text-success font-medium hover:underline mt-2 inline-flex items-center gap-1">
            <span>Review Matches Now</span>
            <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </a>
        </app-card>

        <div class="flex flex-col">
          <app-impact-card
            [value]="impactCount()"
            label="Community Impact"
            description="Verified completed transfers"
            variant="personal"
            icon="★"
          ></app-impact-card>
          <a routerLink="/contributions" class="text-xs text-sand-700 font-medium hover:underline mt-1.5 inline-flex items-center gap-1 self-end px-1">
            <span>View Contribution History</span>
            <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
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
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private resourceApi = inject(ResourceApiService);
  private requestApi = inject(RequestApiService);
  private matchApi = inject(MatchApiService);
  private contributionApi = inject(ContributionApiService);

  readonly resourcesCount = signal<number>(0);
  readonly requestsCount = signal<number>(0);
  readonly matchesCount = signal<number>(0);
  readonly impactCount = signal<number>(0);
  readonly isLoadingStats = signal<boolean>(true);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    const user = this.authService.currentUser();
    const userId = user?.id || user?._id;

    if (user?.stats) {
      this.impactCount.set(user.stats.successfulTransfers || user.stats.completedTransfers || 0);
    }

    forkJoin({
      resources: this.resourceApi.listMine(userId || '').pipe(catchError(() => of([]))),
      requests: this.requestApi.getAll(1, 100).pipe(
        map(res => {
          const list = res.data || [];
          if (!userId) return list;
          return list.filter((r: any) => {
            const reqId = typeof r.requesterId === 'object' ? r.requesterId?._id || r.requesterId?.id : r.requesterId;
            return String(reqId) === String(userId);
          });
        }),
        catchError(() => of([]))
      ),
      matches: this.matchApi.getAll(undefined, 1, 100).pipe(
        map(res => res.data || []),
        catchError(() => of([]))
      ),
      contributions: this.contributionApi.getMyContributions({ limit: 1 }).pipe(
        map(res => res.pagination?.total ?? res.contributions?.length ?? 0),
        catchError(() => of(user?.stats?.successfulTransfers || 0))
      )
    }).subscribe({
      next: ({ resources, requests, matches, contributions }) => {
        this.resourcesCount.set(resources.length);
        this.requestsCount.set(requests.length);
        this.matchesCount.set(matches.length);
        this.impactCount.set(contributions || user?.stats?.successfulTransfers || 0);
        this.isLoadingStats.set(false);
      },
      error: () => {
        this.isLoadingStats.set(false);
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">My Registered Requests</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Track the status of your demand requests and suggested matches with available resources.</p>
        </div>
        <a routerLink="/requests/create">
          <app-button variant="primary" size="sm">+ New Request</app-button>
        </a>
      </div>

      <div class="space-y-4">
        <app-card padding="md">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Medical Equipment</span>
                <app-badge variant="danger" size="sm">Very Urgent</app-badge>
              </div>
              <h3 class="font-bold text-neutral-900 text-base mt-1">Home Ventilator / Oxygen Cylinder</h3>
              <p class="text-xs text-neutral-500">Dokki · Qty: 1 unit</p>
            </div>
            <a routerLink="/matches">
              <app-button variant="primary" size="sm">View Candidate Matches (3)</app-button>
            </a>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class MyRequestsComponent {}

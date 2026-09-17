import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Browse Demand Requests</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Needs registered by verified organizations and individuals to enable fair resource distribution.</p>
        </div>
        <a routerLink="/requests/create">
          <app-button variant="primary" size="sm">+ Submit a Request</app-button>
        </a>
      </div>

      <!-- Requests Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-card padding="md" [isInteractive]="true">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Medical Devices & Equipment</span>
              <app-badge variant="danger" size="sm">Very Urgent</app-badge>
            </div>
            <h3 class="font-bold text-neutral-900 text-base">Home Ventilator / Oxygen Cylinder</h3>
            <p class="text-xs text-neutral-600 line-clamp-2">For a critical elderly case with severe respiratory issues needing immediate support.</p>
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Qty needed: 1 unit</span>
              <span>Dokki, Giza</span>
            </div>
          </div>
        </app-card>

        <app-card padding="md" [isInteractive]="true">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">School Supplies</span>
              <app-badge variant="warning" size="sm">Medium Priority</app-badge>
            </div>
            <h3 class="font-bold text-neutral-900 text-base">School Bags & Supplies for Primary Students</h3>
            <p class="text-xs text-neutral-600 line-clamp-2">A charity collecting supplies for 50 orphaned children at the start of the academic year.</p>
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Qty: 50 bags</span>
              <span>Maadi, Cairo</span>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class RequestListComponent {}

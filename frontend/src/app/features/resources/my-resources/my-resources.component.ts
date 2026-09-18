import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-my-resources',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">My Listed Resources</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Manage the surplus resources you've listed and track their associated matches.</p>
        </div>
        <a routerLink="/resources/create">
          <app-button variant="primary" size="sm">+ List New Resource</app-button>
        </a>
      </div>

      <div class="space-y-4">
        <app-card padding="md">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Medical Equipment</span>
                <app-badge variant="success" size="sm">Available</app-badge>
              </div>
              <h3 class="font-bold text-neutral-900 text-base">Foldable Medical Wheelchair</h3>
              <span class="text-xs text-neutral-500">Maadi · Qty: 1 unit</span>
            </div>
            <div class="flex items-center gap-2">
              <a routerLink="/matches">
                <app-button variant="outline" size="sm">View Matches (2)</app-button>
              </a>
              <app-button variant="ghost" size="sm">Edit</app-button>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class MyResourcesComponent {}

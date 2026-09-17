import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      <a routerLink="/resources" class="text-xs text-neutral-500 hover:text-primary flex items-center gap-1">
        ← Back to Resources
      </a>

      <app-card padding="lg">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <span class="text-xs text-primary font-bold bg-primary-50 px-2 py-0.5 rounded">Medical Equipment</span>
            <h1 class="text-2xl font-bold text-neutral-900 mt-2">Foldable Medical Wheelchair</h1>
            <p class="text-xs text-neutral-500 mt-1">Maadi, Cairo · Listed 2 days ago</p>
          </div>
          <app-badge variant="success">Available</app-badge>
        </div>

        <div class="py-4 border-y border-neutral-100 my-4 text-sm text-neutral-700 leading-relaxed">
          Wheelchair in excellent condition — very lightly used, with adjustable footrests and fully functional handbrakes. Donated for the community, suitable for individuals or organizations serving the elderly.
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-600 mb-6">
          <div>
            <span class="text-neutral-400 block">Available Qty:</span>
            <span class="font-bold text-neutral-900">1 unit</span>
          </div>
          <div>
            <span class="text-neutral-400 block">Pickup Window:</span>
            <span class="font-bold text-neutral-900">Daily 4PM – 8PM</span>
          </div>
          <div>
            <span class="text-neutral-400 block">Transfer Mode:</span>
            <span class="font-bold text-neutral-900">On-site pickup</span>
          </div>
          <div>
            <span class="text-neutral-400 block">Resource Status:</span>
            <span class="font-bold text-success">Inspected & Sanitized</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <a routerLink="/matches">
            <app-button variant="primary">
              Generate Matches for This Resource
            </app-button>
          </a>
        </div>
      </app-card>
    </div>
  `
})
export class ResourceDetailComponent {}

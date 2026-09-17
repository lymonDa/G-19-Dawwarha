import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      <a routerLink="/requests" class="text-xs text-neutral-500 hover:text-primary">← Back to Requests</a>
      <app-card padding="lg">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <span class="text-xs text-primary font-bold bg-primary-50 px-2 py-0.5 rounded">Medical Devices & Equipment</span>
            <h1 class="text-2xl font-bold text-neutral-900 mt-2">Home Ventilator / Oxygen Cylinder</h1>
            <p class="text-xs text-neutral-500 mt-1">Dokki, Giza · Verified Request</p>
          </div>
          <app-badge variant="danger">Very Urgent</app-badge>
        </div>
        <p class="text-sm text-neutral-700 leading-relaxed py-4 border-y border-neutral-100">
          Required for a patient with acute respiratory insufficiency who needs the device for continuous home use under medical supervision.
        </p>
        <div class="flex justify-end pt-4">
          <a routerLink="/matches">
            <app-button variant="primary">Find Matching Resources for This Request</app-button>
          </a>
        </div>
      </app-card>
    </div>
  `
})
export class RequestDetailComponent {}

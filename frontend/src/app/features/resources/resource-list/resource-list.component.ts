import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Browse Available Resources</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Explore surplus resources listed by individuals and organizations for matching and redistribution.</p>
        </div>
        <a routerLink="/resources/create">
          <app-button variant="primary" size="sm">+ List a Resource</app-button>
        </a>
      </div>

      <!-- Filter bar -->
      <div class="flex flex-wrap items-center gap-2 p-3 bg-white rounded-card border border-neutral-200">
        <input
          type="text"
          placeholder="Search resources by name or description..."
          class="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span class="text-xs text-neutral-400">Category:</span>
        <button class="px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">All</button>
        <button class="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200">Medical Equipment</button>
        <button class="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200">Furniture & Supplies</button>
        <button class="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200">Educational Materials</button>
      </div>

      <!-- Sample Resource Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-card padding="md" [isInteractive]="true">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Medical Equipment</span>
              <app-badge variant="success" size="sm">Available</app-badge>
            </div>
            <h3 class="font-bold text-neutral-900 text-base">Foldable Medical Wheelchair</h3>
            <p class="text-xs text-neutral-600 line-clamp-2">Excellent condition — sanitized, inspected, and ready for immediate handover to someone in need.</p>
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Qty: 1 unit</span>
              <span>Maadi, Cairo</span>
            </div>
          </div>
        </app-card>

        <app-card padding="md" [isInteractive]="true">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Office Supplies</span>
              <app-badge variant="success" size="sm">Available</app-badge>
            </div>
            <h3 class="font-bold text-neutral-900 text-base">Study Desks & Training Chairs</h3>
            <p class="text-xs text-neutral-600 line-clamp-2">Office surplus from a company relocation — ideal for tutoring centers or NGO offices.</p>
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Qty: 8 units</span>
              <span>Dokki, Giza</span>
            </div>
          </div>
        </app-card>

        <app-card padding="md" [isInteractive]="true">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Educational Materials</span>
              <app-badge variant="info" size="sm">Matching</app-badge>
            </div>
            <h3 class="font-bold text-neutral-900 text-base">Engineering Reference Books Collection</h3>
            <p class="text-xs text-neutral-600 line-clamp-2">40 scientific references in very good condition — suitable for university students.</p>
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Qty: 40 books</span>
              <span>Nasr City, Cairo</span>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class ResourceListComponent {}

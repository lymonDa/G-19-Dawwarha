import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Explainable Smart Matches</h1>
        <p class="text-xs text-neutral-500 mt-0.5">
          The system calculates a compatibility score based on 5 objective, transparent signals — no black-box algorithms.
        </p>
      </div>

      <!-- Match Result Card -->
      <app-card padding="lg" variant="default">
        <div class="flex flex-col gap-6">
          <!-- Match Score Header & Breakdown -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-success-bg text-success border border-success/30 flex flex-col items-center justify-center shrink-0">
                <span class="text-2xl font-extrabold leading-none">92%</span>
                <span class="text-[10px] font-bold mt-0.5">Excellent</span>
              </div>

              <div>
                <h3 class="text-base font-bold text-neutral-900">Match #M-7429</h3>
                <p class="text-xs text-neutral-500 mt-0.5">
                  Direct match based on category, proximity, quantity availability, and urgency alignment.
                </p>
              </div>
            </div>

            <!-- The 5-Signal Breakdown -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full md:w-auto text-xs">
              <div class="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center gap-1.5">
                <span class="text-success">✓</span>
                <span>Category (Medical)</span>
              </div>
              <div class="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center gap-1.5">
                <span class="text-success">✓</span>
                <span>Location (4.2 km)</span>
              </div>
              <div class="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center gap-1.5">
                <span class="text-success">✓</span>
                <span>Quantity (Match)</span>
              </div>
              <div class="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center gap-1.5">
                <span class="text-success">✓</span>
                <span>Urgency (Urgent)</span>
              </div>
              <div class="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center gap-1.5">
                <span class="text-success">✓</span>
                <span>Window (Open)</span>
              </div>
            </div>
          </div>

          <!-- Pair Comparison: Resource vs Request -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <span class="text-xs font-semibold text-primary block mb-1">Listed Resource (Supply):</span>
              <h4 class="font-bold text-neutral-900 text-sm">Foldable Medical Wheelchair</h4>
              <p class="text-neutral-500 mt-1">Maadi · Donor: Ahmed Mahmoud</p>
            </div>

            <div class="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <span class="text-xs font-semibold text-primary block mb-1">Demand Request:</span>
              <h4 class="font-bold text-neutral-900 text-sm">Wheelchair needed for elderly patient</h4>
              <p class="text-neutral-500 mt-1">Dokki · Org: Nahr Al-Ataa Association</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <app-button variant="ghost" size="sm">Decline Match</app-button>
            <a routerLink="/handovers/m-7429">
              <app-button variant="primary" size="md">
                Accept Match & Proceed to Handover →
              </app-button>
            </a>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class MatchesListComponent {}

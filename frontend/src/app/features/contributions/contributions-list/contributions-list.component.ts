import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-contributions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Contributions & Community Impact Log</h1>
        <p class="text-xs text-neutral-500 mt-0.5">
          A non-financial ledger documenting completed transfers and successfully redistributed resources.
        </p>
      </div>

      <!-- Impact Score Summary -->
      <app-card padding="lg" variant="sand">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-sand-500 text-white font-bold flex items-center justify-center text-xl shadow-sm">
              ★
            </div>
            <div>
              <span class="text-xs font-semibold text-sand-700 uppercase tracking-wider">Zero-Loss Verified Record</span>
              <h2 class="text-xl font-bold text-neutral-900 mt-0.5">14 Successful Handovers</h2>
              <p class="text-xs text-neutral-600 mt-1">Contributed to serving 85+ beneficiaries across Cairo and Giza.</p>
            </div>
          </div>

          <div class="flex items-center gap-4 text-center">
            <div class="p-3 bg-white/80 rounded-lg border border-sand-200">
              <span class="text-xs text-neutral-500 block">Resources Donated</span>
              <span class="text-xl font-bold text-sand-700">9</span>
            </div>
            <div class="p-3 bg-white/80 rounded-lg border border-sand-200">
              <span class="text-xs text-neutral-500 block">Requests Fulfilled</span>
              <span class="text-xl font-bold text-sand-700">5</span>
            </div>
          </div>
        </div>
      </app-card>

      <!-- History List -->
      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-semibold text-neutral-900">Recently Completed Transfers</h3>

        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <h4 class="text-sm font-bold text-neutral-900">Foldable Medical Wheelchair</h4>
                <p class="text-xs text-neutral-500">Delivered to Nahr Al-Ataa Association · Maadi</p>
              </div>
            </div>
            <app-badge variant="success" size="sm">Completed</app-badge>
          </div>
        </app-card>

        <app-card padding="md" variant="bordered">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <h4 class="text-sm font-bold text-neutral-900">20 Engineering Academic References</h4>
                <p class="text-xs text-neutral-500">Delivered to "A Book for Every Child" Initiative · Dokki</p>
              </div>
            </div>
            <app-badge variant="success" size="sm">Completed</app-badge>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class ContributionsListComponent {}

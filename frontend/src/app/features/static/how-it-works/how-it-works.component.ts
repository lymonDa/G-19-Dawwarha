import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-8">
      <div class="text-center">
        <span class="text-xs font-semibold text-primary uppercase tracking-wider">User & Partner Guide</span>
        <h1 class="text-3xl font-extrabold text-neutral-900 mt-1">How Dawwarha Works — Step by Step</h1>
        <p class="text-sm text-neutral-600 mt-2 max-w-xl mx-auto leading-relaxed">
          A rigorous redistribution loop that starts with listing a resource and ends with documented community impact.
        </p>
      </div>

      <div class="space-y-4">
        <app-card padding="md">
          <div class="flex items-start gap-4">
            <span class="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center shrink-0">1</span>
            <div>
              <h4 class="font-semibold text-neutral-900 text-sm">List a Surplus Resource (Supply)</h4>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                The donor specifies the resource type, available quantity, geographic location (neighborhood & city), and pickup availability windows.
              </p>
            </div>
          </div>
        </app-card>

        <app-card padding="md">
          <div class="flex items-start gap-4">
            <span class="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center shrink-0">2</span>
            <div>
              <h4 class="font-semibold text-neutral-900 text-sm">Register a Demand Request</h4>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                Verified organizations or eligible individuals specify what they need and their urgency level (low, medium, urgent).
              </p>
            </div>
          </div>
        </app-card>

        <app-card padding="md">
          <div class="flex items-start gap-4">
            <span class="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center shrink-0">3</span>
            <div>
              <h4 class="font-semibold text-neutral-900 text-sm">Explainable Matching (Rule-Based)</h4>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                The matching engine computes compatibility based on 5 transparent signals — no black-box algorithms: category match, geographic proximity, quantity sufficiency, urgency level, and pickup window overlap.
              </p>
            </div>
          </div>
        </app-card>

        <app-card padding="md">
          <div class="flex items-start gap-4">
            <span class="w-8 h-8 rounded-full bg-sand-500 text-white font-bold text-sm flex items-center justify-center shrink-0">4</span>
            <div>
              <h4 class="font-semibold text-neutral-900 text-sm">Two-Sided Handover & Impact Log</h4>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                The donor confirms delivery and the recipient confirms receipt. Only when both confirmations are recorded is the transfer finalized and logged in the community impact ledger.
              </p>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class HowItWorksComponent {}

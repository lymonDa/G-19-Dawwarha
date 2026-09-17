import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-8">
      <div class="text-center">
        <span class="text-xs font-semibold text-primary uppercase tracking-wider">About Dawwarha Platform</span>
        <h1 class="text-3xl font-extrabold text-neutral-900 mt-1">Redirecting Surplus for Sustainable Community Impact</h1>
        <p class="text-sm text-neutral-600 mt-2 max-w-xl mx-auto leading-relaxed">
          Dawwarha is a civic digital infrastructure designed to bridge the gap between urban surplus resources and the needs of priority communities and civil society organizations.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <app-card padding="lg">
          <h3 class="text-base font-bold text-neutral-900 mb-2">Our Vision & Values</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">
            We believe every surplus resource is a right and a priority for someone else in the same geographic area. We strive to transform charitable giving from ad-hoc practices into a documented, accountable, and transparent digital system.
          </p>
        </app-card>

        <app-card padding="lg">
          <h3 class="text-base font-bold text-neutral-900 mb-2">Safety & Transparency Standards</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">
            Strict vetting of partner organizations, location-aware Explainable Matching, and a two-sided handover protocol that ensures no transfer is finalized without confirmation from both parties.
          </p>
        </app-card>
      </div>
    </div>
  `
})
export class AboutComponent {}

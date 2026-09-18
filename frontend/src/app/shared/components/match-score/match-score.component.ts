import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchScoreBreakdown } from '../../../core/models/match.model';

export interface MatchSignalDisplay {
  id: 'category' | 'location' | 'quantity' | 'urgency' | 'availability';
  label: string;
  score: number;
  percentage: number;
  isSatisfied: boolean;
}

@Component({
  selector: 'app-match-score',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-xl border border-neutral-200 bg-neutral-0 p-4 transition-all"
      [attr.aria-label]="confidenceText"
      role="region"
    >
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center rounded-lg px-3 py-1.5 text-lg font-bold transition-colors md:text-xl"
            [ngClass]="scoreColorClasses"
          >
            <span>{{ percentage }}% Match</span>
          </div>

          <p class="text-xs text-neutral-500 md:text-sm">
            {{ confidenceText }}
          </p>
        </div>

        <div class="hidden items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 sm:inline-flex">
          <svg class="h-3.5 w-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Rule-based Verification</span>
        </div>
      </div>

      <div class="mt-3">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Signals Breakdown (Fixed Order)
        </p>

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          @for (signal of signals; track signal.id) {
            <div
              class="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-2.5 py-2 text-xs transition-colors hover:bg-neutral-100"
              [attr.aria-label]="signal.label + ': ' + (signal.isSatisfied ? 'Matched' : 'Partial/Unmatched') + ' (' + signal.percentage + '%)'"
            >
              <div class="flex items-center gap-1.5">
                @if (signal.isSatisfied) {
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                } @else {
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                }

                <span class="font-medium text-neutral-700">{{ signal.label }}</span>
              </div>

              <span class="text-[11px] font-semibold text-neutral-500">
                {{ signal.percentage }}%
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MatchScoreComponent {
  @Input() score: number = 0;
  @Input() breakdown?: MatchScoreBreakdown;

  /**
   * Normalized whole-integer match percentage (no deceptive decimals, e.g. 92% instead of 91.73%)
   */
  get percentage(): number {
    if (this.score === undefined || this.score === null || isNaN(this.score)) {
      return 0;
    }
    // Handle both 0..1 range (backend) and 0..100 range
    const val = this.score <= 1 && this.score > 0 ? this.score * 100 : this.score;
    return Math.min(100, Math.max(0, Math.round(val)));
  }

  /**
   * Score range treatments strictly per DESIGN.md Section 16:
   * 85–100%: success-colored numeral / accent
   * 60–84%: info-colored numeral / accent
   */
  get isHighMatch(): boolean {
    return this.percentage >= 85;
  }

  get isModerateMatch(): boolean {
    return this.percentage >= 60 && this.percentage < 85;
  }

  get scoreColorClasses(): string {
    if (this.isHighMatch) {
      return 'text-success bg-success-bg border-success/30';
    }
    if (this.isModerateMatch) {
      return 'text-info bg-info-bg border-info/30';
    }
    return 'text-neutral-700 bg-neutral-100 border-neutral-200';
  }

  /**
   * Factual confidence statement explaining the score (strict rule: NO "AI thinks...")
   */
  get confidenceText(): string {
    return `${this.percentage}% match based on category, location, quantity, urgency, and availability.`;
  }

  /**
   * 5 match signals in FIXED ORDER always (DESIGN.md Section 16 & Product Brief Section 12):
   * 1. Category
   * 2. Location
   * 3. Quantity
   * 4. Urgency
   * 5. Availability
   */
  get signals(): MatchSignalDisplay[] {
    const b = this.breakdown || {
      category: 1,
      location: 1,
      quantity: 1,
      urgency: 1,
      availability: 1
    };

    const normalize = (val?: number | boolean): { score: number; percentage: number; isSatisfied: boolean } => {
      let num = 0;
      if (typeof val === 'boolean') {
        num = val ? 1 : 0;
      } else if (typeof val === 'number' && !isNaN(val)) {
        num = val;
      }
      const normalized = num <= 1 && num > 0 ? num * 100 : num;
      const pct = Math.min(100, Math.max(0, Math.round(normalized)));
      return {
        score: num,
        percentage: pct,
        isSatisfied: pct >= 50
      };
    };

    return [
      {
        id: 'category',
        label: 'Category',
        ...normalize(b.category)
      },
      {
        id: 'location',
        label: 'Location',
        ...normalize(b.location)
      },
      {
        id: 'quantity',
        label: 'Quantity',
        ...normalize(b.quantity)
      },
      {
        id: 'urgency',
        label: 'Urgency',
        ...normalize(b.urgency)
      },
      {
        id: 'availability',
        label: 'Availability',
        ...normalize(b.availability)
      }
    ];
  }
}
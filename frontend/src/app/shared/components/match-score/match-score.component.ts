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
  templateUrl: './match-score.component.html',
  styleUrls: ['./match-score.component.css']
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

    const normalize = (val?: number): { score: number; percentage: number; isSatisfied: boolean } => {
      const num = typeof val === 'number' && !isNaN(val) ? val : 0;
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
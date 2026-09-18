import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatchApiService } from '../services/match-api.service';
import { Match } from '../../../core/models/match.model';
import { MatchScoreComponent } from '../../../shared/components/match-score/match-score.component';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatchScoreComponent],
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.css']
})
export class MatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(MatchApiService);

  match: Match | null = null;
  matchId = '';
  loading = true;
  processing = false;

  successMessage = '';
  errorMessage = '';

  showAcceptConfirm = false;
  showRejectConfirm = false;

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id') || '';
    if (this.matchId) {
      this.loadMatch();
    } else {
      this.errorMessage = 'No Match ID provided.';
      this.loading = false;
    }
  }

  loadMatch(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getById(this.matchId).subscribe({
      next: (data) => {
        this.match = data;
        this.loading = false;
        if (!data) {
          this.errorMessage = 'Match not found or expired.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load match details.';
      }
    });
  }

  promptAccept(): void {
    this.showAcceptConfirm = true;
  }

  confirmAccept(): void {
    this.showAcceptConfirm = false;
    this.processing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.accept(this.matchId).subscribe({
      next: (res) => {
        this.processing = false;
        if (this.match) {
          this.match = { ...this.match, status: 'accepted' };
        }
        this.successMessage = 'Match accepted! Handover coordination has been successfully generated.';
      },
      error: (err) => {
        this.processing = false;
        if (err.status === 409) {
          this.errorMessage = 'Conflict: this match or associated resource is no longer available.';
        } else if (err.status === 403) {
          this.errorMessage = 'You do not have permission to accept this match.';
        } else {
          this.errorMessage = err?.error?.message || 'Failed to accept match.';
        }
      }
    });
  }

  promptReject(): void {
    this.showRejectConfirm = true;
  }

  confirmReject(): void {
    this.showRejectConfirm = false;
    this.processing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.reject(this.matchId).subscribe({
      next: (res) => {
        this.processing = false;
        if (this.match) {
          this.match = { ...this.match, status: 'rejected' };
        }
        this.successMessage = 'Match rejected. The resource has been returned to available status.';
      },
      error: (err) => {
        this.processing = false;
        this.errorMessage = err?.error?.message || 'Failed to reject match.';
      }
    });
  }

  get resourceTitle(): string {
    return this.match?.resourceId?.title || 'Resource';
  }

  get resourceCategory(): string {
    const cat = this.match?.resourceId?.categoryId;
    return typeof cat === 'object' && cat?.name ? cat.name : 'Category';
  }

  get resourceQuantity(): number {
    return this.match?.resourceId?.quantity || 1;
  }

  get resourceLocation(): string {
    const loc = this.match?.resourceId?.location;
    if (!loc) return 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
  }

  get requestCategory(): string {
    const cat = this.match?.requestId?.categoryId;
    return typeof cat === 'object' && cat?.name ? cat.name : 'Category';
  }

  get requestQuantity(): number {
    return this.match?.requestId?.quantity || 1;
  }

  get requestUrgency(): string {
    return this.match?.requestId?.urgency || 'medium';
  }

  get requestLocation(): string {
    const loc = this.match?.requestId?.location;
    if (!loc) return 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
  }
}
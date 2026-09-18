import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatchApiService } from '../services/match-api.service';
import { Match, MatchStatus } from '../../../core/models/match.model';
import { MatchCardComponent } from '../../../shared/components/match-card/match-card.component';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatchCardComponent],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css']
})
export class MatchListComponent implements OnInit {
  private api = inject(MatchApiService);
  private route = inject(ActivatedRoute);

  matches: Match[] = [];
  selectedStatus: MatchStatus | '' = '';
  loading = true;
  processingId = '';
  generatingMatches = false;

  successMessage = '';
  errorMessage = '';

  generateResourceId = '';

  ngOnInit(): void {
    // Check if a resourceId query param was passed to trigger generation
    const paramResId = this.route.snapshot.queryParamMap.get('resourceId');
    if (paramResId) {
      this.generateResourceId = paramResId;
    }
    this.loadMatches();
  }

  loadMatches(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getAll(this.selectedStatus || undefined).subscribe({
      next: (res) => {
        const items = res.data || [];
        this.matches = items;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load candidate matches.';
      }
    });
  }

  generateMatchesForResource(): void {
    if (!this.generateResourceId.trim()) {
      return;
    }
    this.generatingMatches = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.generate(this.generateResourceId.trim()).subscribe({
      next: (res) => {
        this.generatingMatches = false;
        const count = Array.isArray(res) ? res.length : 0;
        this.successMessage = `Matching engine completed! Generated ${count} candidate match(es).`;
        this.loadMatches();
      },
      error: (err) => {
        this.generatingMatches = false;
        this.errorMessage = err?.error?.message || 'Failed to generate matches for resource.';
      }
    });
  }

  onAccept(match: Match): void {
    const id = match._id || match.id;
    if (!id) return;

    this.processingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.accept(id).subscribe({
      next: () => {
        this.processingId = '';
        this.successMessage = 'Match accepted! Handover coordination has been initiated.';
        this.loadMatches();
      },
      error: (err) => {
        this.processingId = '';
        if (err.status === 409) {
          this.errorMessage = 'Conflict: this match or associated resource is no longer available.';
        } else if (err.status === 403) {
          this.errorMessage = 'You are not authorized to accept this match.';
        } else {
          this.errorMessage = err?.error?.message || 'Failed to accept match.';
        }
      }
    });
  }

  onReject(match: Match): void {
    const id = match._id || match.id;
    if (!id) return;

    this.processingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.reject(id).subscribe({
      next: () => {
        this.processingId = '';
        this.successMessage = 'Match rejected. The resource is now available for other matches.';
        this.loadMatches();
      },
      error: (err) => {
        this.processingId = '';
        this.errorMessage = err?.error?.message || 'Failed to reject match.';
      }
    });
  }
}

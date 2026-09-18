import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Match } from '../../../core/models/match.model';
import { MatchScoreComponent } from '../match-score/match-score.component';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatchScoreComponent],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css']
})
export class MatchCardComponent {
  @Input({ required: true }) match!: Match;
  @Input() loading = false;
  @Input() showDetailsLink = true;

  @Output() accept = new EventEmitter<Match>();
  @Output() reject = new EventEmitter<Match>();

  showAcceptConfirm = false;
  showRejectConfirm = false;

  get matchId(): string {
    return this.match?._id || this.match?.id || '';
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

  get statusLabel(): string {
    return (this.match?.status || 'proposed').toUpperCase();
  }

  get statusBadgeClass(): string {
    switch (this.match?.status) {
      case 'accepted':
        return 'bg-primary-100 text-primary-800 border-primary-500/30';
      case 'rejected':
        return 'bg-danger-bg text-danger border-danger/30';
      case 'expired':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      case 'proposed':
      default:
        return 'bg-info-bg text-info border-info/30';
    }
  }

  triggerAccept(): void {
    this.showAcceptConfirm = true;
  }

  confirmAccept(): void {
    this.showAcceptConfirm = false;
    this.accept.emit(this.match);
  }

  cancelAccept(): void {
    this.showAcceptConfirm = false;
  }

  triggerReject(): void {
    this.showRejectConfirm = true;
  }

  confirmReject(): void {
    this.showRejectConfirm = false;
    this.reject.emit(this.match);
  }

  cancelReject(): void {
    this.showRejectConfirm = false;
  }
}
export interface MatchScoreBreakdown {
  category: boolean;
  location: boolean;
  quantity: boolean;
  urgency: boolean;
  availability: boolean;
}

export type MatchStatus = 'proposed' | 'accepted' | 'rejected' | 'expired';

export interface Match {
  id: string;
  resourceId: string;
  requestId: string;
  score: number; // Integer 0-100 per DESIGN.md Section 16
  scoreBreakdown: MatchScoreBreakdown;
  status: MatchStatus;
  providerId: string;
  requesterId: string;
  createdAt: string;
  updatedAt?: string;
}

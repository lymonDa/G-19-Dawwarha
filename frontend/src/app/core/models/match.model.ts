export interface MatchScoreBreakdown {
  category: number;
  location: number;
  quantity: number;
  urgency: number;
  availability: number;
}

export type MatchStatus =
  | 'proposed'
  | 'accepted'
  | 'rejected'
  | 'expired';

export interface Match {
  _id?: string;
  id?: string;

  resourceId: any;
  requestId: any;

  score: number;

  scoreBreakdown: MatchScoreBreakdown;

  status: MatchStatus;

  providerId: string;
  requesterId: string;

  createdAt: string;

  expiresAt?: string;
}
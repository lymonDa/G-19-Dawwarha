export interface MatchScoreBreakdown {
<<<<<<< HEAD
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
=======
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
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

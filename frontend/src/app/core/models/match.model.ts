import { Resource } from './resource.model';
import { Request } from './request.model';
import { User } from './user.model';

export interface MatchScoreBreakdown {
  category: number | boolean;
  location: number | boolean;
  quantity: number | boolean;
  urgency: number | boolean;
  availability: number | boolean;
}

export type MatchStatus = 'proposed' | 'accepted' | 'rejected' | 'expired';

export interface Match {
  id: string;
  _id?: string;

  resourceId: string | Resource;
  requestId: string | Request;

  providerId: string | User;
  requesterId: string | User;

  score: number; // Decimal 0-1 from backend or integer 0-100 per DESIGN.md §16
  scoreBreakdown: MatchScoreBreakdown;

  status: MatchStatus;

  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface MatchFilters {
  status?: MatchStatus;
  all?: boolean;
  page?: number;
  limit?: number;
}

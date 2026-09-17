import { Category } from './category.model';

export type RequestUrgency = 'low' | 'medium' | 'high';

export type RequestStatus =
  | 'draft'
  | 'published'
  | 'open'
  | 'matched'
  | 'accepted'
  | 'in_handover'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface Request {
  id: string;
  category: Category;
  quantity: number;
  unit?: string;
  urgency: RequestUrgency;
  description: string;
  location: { area: string; city: string };
  status: RequestStatus;
  requesterId: string;
  requesterOrgId?: string;
  isStanding?: boolean;
  createdAt: string;
  updatedAt?: string;
}

import { Category } from './category.model';
import { User } from './user.model';

export type RequestUrgency = 'low' | 'medium' | 'high';

export type RequestStatus =
  | 'draft'
  | 'published'
  | 'matched'
  | 'accepted'
  | 'fulfilled'
  | 'cancelled'
  | 'expired';

export interface RequestLocation {
  city: string;
  area?: string;
}

export interface Request {
  id: string;
  _id?: string;

  requesterId: string | User;
  requesterOrgId?: string | null;

  categoryId: string | Category;

  quantity: number;

  urgency: RequestUrgency;

  location: RequestLocation;

  description?: string;

  status: RequestStatus;

  createdAt: string;
  updatedAt?: string;
}

export interface RequestPayload {
  categoryId: string;
  quantity: number;
  urgency: RequestUrgency;
  location: RequestLocation;
  description?: string;
  requesterOrgId?: string | null;
}

export interface RequestFilters {
  status?: RequestStatus;
  categoryId?: string;
  city?: string;
  urgency?: RequestUrgency;
  page?: number;
  limit?: number;
}

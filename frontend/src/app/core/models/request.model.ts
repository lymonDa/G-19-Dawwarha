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

export interface RequestCategory {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  isActive?: boolean;
}

export interface Request {
  _id?: string;
  id?: string;

  requesterId: string;
  requesterOrgId?: string | null;

  categoryId: string | RequestCategory;

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
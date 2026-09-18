<<<<<<< HEAD
=======
import { Category } from './category.model';

>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
export type RequestUrgency = 'low' | 'medium' | 'high';

export type RequestStatus =
  | 'draft'
  | 'published'
<<<<<<< HEAD
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
=======
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
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

import { Category } from './category.model';

export type ResourceStatus =
  | 'draft'
  | 'published'
  | 'available'
  | 'matched'
  | 'accepted'
  | 'in_handover'
  | 'completed'
  | 'impact_recorded'
  | 'unavailable'
  | 'expired'
  | 'cancelled';

export interface Resource {
  id: string;
  title: string;
  category: Category;
  quantity: number;
  unit?: string;
  description: string;
  location: { area: string; city: string };
  availabilityWindow: { start: string; end: string };
  status: ResourceStatus;
  providerId: string;
  providerOrgId?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

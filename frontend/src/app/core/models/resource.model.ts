import { Category } from './category.model';

export type ResourceStatus =
  | 'draft'
  | 'published'
  | 'available'
  | 'matched'
  | 'accepted'
  | 'in_handover'
  | 'completed'
<<<<<<< HEAD
  | 'cancelled'
  | 'expired';

export interface ResourceLocation {
  city: string;
  area?: string;
  address?: string;
}

export interface Resource {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  categoryId: string | Category;
  quantity: number;
  location: ResourceLocation;
  status: ResourceStatus;
  providerId: string | any;
  availabilityWindow?: {
    startDate?: string;
    endDate?: string;
  };
  createdAt?: string;
=======
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
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
  updatedAt?: string;
}

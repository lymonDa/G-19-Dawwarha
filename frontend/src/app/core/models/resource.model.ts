import { Category } from './category.model';

export type ResourceStatus =
  | 'draft'
  | 'published'
  | 'available'
  | 'matched'
  | 'accepted'
  | 'in_handover'
  | 'completed'
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
  updatedAt?: string;
}

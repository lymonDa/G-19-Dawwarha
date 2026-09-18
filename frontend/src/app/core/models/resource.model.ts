import { Category } from './category.model';
import { User } from './user.model';

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

export type ResourceLifecycleAction =
  | 'publish'
  | 'cancel'
  | 'markAvailable'
  | 'match'
  | 'markUnavailable'
  | 'expire'
  | 'accept'
  | 'reject'
  | 'release'
  | 'startHandover'
  | 'complete'
  | 'logImpact'
  | 'reopen';

export interface ResourceLocation {
  city: string;
  area?: string;
}

export interface ResourceAvailabilityWindow {
  start: string;
  end: string;
}

export interface ResourceFilters {
  category?: string;
  categoryId?: string;
  city?: string;
  area?: string;
  status?: ResourceStatus | ResourceStatus[];
  page?: number;
  limit?: number;
}

export interface Resource {
  id: string;
  _id?: string;
  title: string;
  description: string;
  categoryId?: string;
  category?: Category;
  quantity: number;
  location: ResourceLocation;
  availabilityWindow: ResourceAvailabilityWindow;
  status: ResourceStatus;
  providerId: string | User;
  providerOrgId?: string | null;
  safetyDisclosure?: string | null;
  createdAt: string;
  updatedAt?: string;
}


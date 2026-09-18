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

export interface ResourceFilters {
  categoryId?: string;
  status?: ResourceStatus;
  city?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface Resource {
  id: string;
  _id?: string;
  title: string;
  category?: Category;
  categoryId?: string;
  quantity: number;
  unit?: string;
  description: string;
  location: { area?: string; city: string };
  availabilityWindow?: { start?: string; end?: string; startDate?: string; endDate?: string };
  status: ResourceStatus;
  providerId: string;
  providerOrgId?: string;
  imageUrl?: string;
  safetyDisclosure?: string;
  createdAt: string;
  updatedAt?: string;
}


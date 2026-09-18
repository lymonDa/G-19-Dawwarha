export type UserRole = 'user' | 'organization' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserLocation {
  area: string;
  city: string;
}

export interface UserStats {
  contributionsCount: number;
  successfulTransfers: number;
  rating: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  location?: UserLocation;
  address?: {
    street?: string;
    city?: string;
    area?: string;
    country?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  organizationId?: string;
  stats?: UserStats;
  createdAt: string;
  updatedAt?: string;
}

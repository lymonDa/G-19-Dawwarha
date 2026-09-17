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
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  location?: UserLocation;
  organizationId?: string;
  stats?: UserStats;
  createdAt: string;
  updatedAt?: string;
}

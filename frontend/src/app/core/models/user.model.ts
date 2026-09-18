<<<<<<< HEAD
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'individual' | 'organization' | 'admin';
  organizationId?: string | null;
  isVerified?: boolean;
  createdAt?: string;
=======
export type UserRole = 'user' | 'organization' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserLocation {
  area: string;
  city: string;
}

export interface UserStats {
  contributionsCount?: number;
  successfulTransfers?: number;
  completedTransfers?: number;
  reputationScore?: number;
  rating?: number;
  requestsCount?: number;
  matchesCount?: number;
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
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
  updatedAt?: string;
}

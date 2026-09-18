export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'individual' | 'organization' | 'admin';
  organizationId?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

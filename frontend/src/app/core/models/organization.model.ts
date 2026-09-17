export type OrganizationVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type OrganizationType = 'ngo' | 'charity' | 'community_group' | 'educational' | 'other';

export interface OrgContact {
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface OrgDocument {
  name: string;
  url: string;
  uploadedAt: string;
}

export interface OrganizationStats {
  resourcesShared: number;
  requestsFulfilled: number;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  registrationNumber?: string;
  description?: string;
  verificationStatus: OrganizationVerificationStatus;
  verificationNotes?: string;
  documents?: OrgDocument[];
  ownerUserId: string;
  contact: OrgContact;
  stats?: OrganizationStats;
  createdAt: string;
  updatedAt?: string;
}

export interface Contribution {
  _id?: string;
  id: string;
  type?: 'transfer_completed';
  handoverId: string;
  providerId: string;
  seekerId: string;
  categoryId?: string;
  category?: string;
  quantity: number;
  resourceTitle?: string;
  counterpartName?: string;
  counterpartVerified?: boolean;
  role?: 'provider' | 'seeker';
  impactScore?: number;
  recordedAt?: string;
  createdAt: string;
}

export interface ContributionSummary {
  totalContributions: number;
  resourcesRescued: number;
  requestsFulfilled: number;
  beneficiariesCount?: number;
}

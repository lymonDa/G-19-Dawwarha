export interface Contribution {
  id: string;
  userId: string;
  handoverId: string;
  role: 'provider' | 'seeker';
  category: string;
  quantity: number;
  impactScore?: number;
  recordedAt: string;
  createdAt: string;
}

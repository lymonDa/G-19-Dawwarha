export type HandoverStatus = 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface Handover {
  id: string;
  matchId: string;
  providerId: string;
  seekerId: string;
  confirmedByProvider: boolean;
  confirmedBySeeker: boolean;
  status: HandoverStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

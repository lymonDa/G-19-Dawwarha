export type HandoverStatus = 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Handover {
  id: string;
  matchId: string;
  resourceId?: string;
  requestId?: string;
  providerId: string;
  seekerId: string;
  confirmedByProvider: boolean;
  confirmedBySeeker: boolean;
  providerConfirmedAt?: string | null;
  seekerConfirmedAt?: string | null;
  status: HandoverStatus;
  notes?: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface HandoverConfirmResponse {
  status: HandoverStatus;
  bothConfirmed: boolean;
  handover?: Handover;
  message?: string;
}

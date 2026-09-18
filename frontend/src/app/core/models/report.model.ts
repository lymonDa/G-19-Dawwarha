export type ReportTargetType = 'resource' | 'request' | 'user';
export type ReportStatus = 'open' | 'reviewed' | 'resolved';
export type ReportReason = 'spam' | 'fraud' | 'inappropriate' | 'safety' | 'other';

export interface Report {
  _id?: string;
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  resolutionNotes?: string | null;
  resolutionNote?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

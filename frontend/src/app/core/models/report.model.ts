export type ReportTargetType = 'resource' | 'request' | 'user' | 'organization';
export type ReportStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  resolutionNote?: string;
  resolvedByAdminId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'match_created'
  | 'match_accepted'
  | 'report_resolved'
  | 'org_verification_decided';

export interface NotificationRelatedEntity {
  type?: string;
  id?: string;
}

export interface Notification {
  _id?: string;
  id: string;
  recipientId?: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: NotificationRelatedEntity | null;
  readAt?: string | null;
  read?: boolean;
  link?: string;
  createdAt: string;
}

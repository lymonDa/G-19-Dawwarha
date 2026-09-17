export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'handover' | 'system' | 'report';
  read: boolean;
  link?: string;
  createdAt: string;
}

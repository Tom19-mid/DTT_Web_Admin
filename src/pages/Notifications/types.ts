export type NotificationType = string;

export interface Notification {
  notificationId: number;
  userId?: string | null;
  title: string;
  content: string;
  type: NotificationType;
  relatedId?: number | null;
  relatedType?: string | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
}

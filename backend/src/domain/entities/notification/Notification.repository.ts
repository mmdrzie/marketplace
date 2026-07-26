import { Notification } from './Notification.entity.js';

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: number): Promise<Notification | null>;
  findByUser(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
  markRead(id: number, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

import { protectedFetch as api } from './base';

export interface Notification {
  id: number;
  user_id: string; // Firebase UID
  title: string;
  message: string;
  type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery' | 'new_delivery';
  read: boolean;
  created_at: string; // ISO string from Date
  related_delivery_id?: number;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationsAPI = {
  // Получить уведомления пользователя
  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Получить количество непрочитанных уведомлений
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.count;
  },

  // Отметить уведомление как прочитанное
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Отметить все уведомления как прочитанные
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/mark-all-read');
  },
};
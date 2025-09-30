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

// Типы для создания уведомлений
export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery' | 'new_delivery';
  read: boolean;
  related_delivery_id?: number;
}

export interface OfferReceivedRequest {
  senderId: string;
  deliveryId: number;
  pickerName: string;
  price: number;
}

export interface OfferAcceptedRequest {
  senderId: string;
  deliveryId: number;
}

export interface IncomingDeliveryRequest {
  recipientId: string;
  deliveryId: number;
  senderName: string;
}

export interface StatusUpdateRequest {
  userId: string;
  deliveryId: number;
  status: string;
  message: string;
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

  // === МЕТОДЫ ДЛЯ СОЗДАНИЯ УВЕДОМЛЕНИЙ ===

  // Создать уведомление о новом предложении
  notifyOfferReceived: async (data: OfferReceivedRequest): Promise<Notification> => {
    const response = await api.post('/notifications/offer-received', data);
    return response.data;
  },

  // Создать уведомление о принятии предложения
  notifyOfferAccepted: async (data: OfferAcceptedRequest): Promise<Notification> => {
    const response = await api.post('/notifications/offer-accepted', data);
    return response.data;
  },

  // Создать уведомление о входящей доставке
  notifyIncomingDelivery: async (data: IncomingDeliveryRequest): Promise<Notification> => {
    const response = await api.post('/notifications/incoming-delivery', data);
    return response.data;
  },

  // Создать уведомление об обновлении статуса
  notifyStatusUpdate: async (data: StatusUpdateRequest): Promise<Notification> => {
    const response = await api.post('/notifications/status-update', data);
    return response.data;
  },

  // Общий метод для создания произвольного уведомления
  createNotification: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await api.post('/notifications/create', data);
    return response.data;
  },
};
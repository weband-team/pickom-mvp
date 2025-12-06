import { protectedFetch as api } from './base';

export interface Notification {
  id: number;
  user_id: string; // Firebase UID
  title: string;
  message: string;
  type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery' | 'new_delivery' | 'recipient_confirmed' | 'recipient_rejected';
  read: boolean;
  created_at: string; // ISO string from Date
  related_delivery_id?: number;
}

export interface UnreadCountResponse {
  count: number;
}

// Types for creating notifications
export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery' | 'new_delivery' | 'recipient_confirmed' | 'recipient_rejected';
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
  // Get user notifications
  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.count;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/mark-all-read');
  },

  // === METHODS FOR CREATING NOTIFICATIONS ===

  // Create notification about new offer
  notifyOfferReceived: async (data: OfferReceivedRequest): Promise<Notification> => {
    const response = await api.post('/notifications/offer-received', data);
    return response.data;
  },

  // Create notification about offer acceptance
  notifyOfferAccepted: async (data: OfferAcceptedRequest): Promise<Notification> => {
    const response = await api.post('/notifications/offer-accepted', data);
    return response.data;
  },

  // Create notification about incoming delivery
  notifyIncomingDelivery: async (data: IncomingDeliveryRequest): Promise<Notification> => {
    const response = await api.post('/notifications/incoming-delivery', data);
    return response.data;
  },

  // Create notification about status update
  notifyStatusUpdate: async (data: StatusUpdateRequest): Promise<Notification> => {
    const response = await api.post('/notifications/status-update', data);
    return response.data;
  },

  // General method for creating custom notification
  createNotification: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await api.post('/notifications/create', data);
    return response.data;
  },
};
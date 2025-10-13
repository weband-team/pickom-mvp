export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isFromPicker: boolean;
  chatSessionId?: string;
  attachments?: string[];
  read?: boolean;
  createdAt?: Date;
}

export interface DeliveryInfo {
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: string;
  agreedPrice: number;
}

export interface ChatSession {
  id: string;
  pickerId: string;
  pickerName?: string;
  customerId?: string;
  senderId?: string;
  senderName?: string;
  deliveryInfo?: DeliveryInfo;
  deliveryId?: number;
  messages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  status?: 'active' | 'price_confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
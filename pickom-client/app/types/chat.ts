export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isFromPicker: boolean;
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
  customerId: string;
  deliveryInfo: DeliveryInfo;
  messages: Message[];
  status: 'active' | 'price_confirmed' | 'completed' | 'cancelled';
}
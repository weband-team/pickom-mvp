import { ChatSession, Message, DeliveryInfo } from '../types/chat';

export const mockDeliveryInfo: DeliveryInfo = {
  pickupAddress: "Warszawa Central Station",
  dropoffAddress: "Krakowskie Przedmieście 5",
  pickupTime: "Today, 15:30",
  agreedPrice: 25
};

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'picker-1',
    senderName: 'Adam Kowalski',
    content: 'Hi! I can pick up your package from Warszawa Central Station. When would be the best time?',
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    isFromPicker: true
  },
  {
    id: 'msg-2',
    senderId: 'customer-1',
    senderName: 'You',
    content: 'Hello! Around 3:30 PM today would be perfect. Is that okay for you?',
    timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    isFromPicker: false
  },
  {
    id: 'msg-3',
    senderId: 'picker-1',
    senderName: 'Adam Kowalski',
    content: 'Perfect! I can be there at 15:30. The price will be 25 zł as discussed. Is that acceptable?',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isFromPicker: true
  },
  {
    id: 'msg-4',
    senderId: 'customer-1',
    senderName: 'You',
    content: 'Yes, 25 zł sounds good. Thank you!',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    isFromPicker: false
  },
  {
    id: 'msg-5',
    senderId: 'picker-1',
    senderName: 'Adam Kowalski',
    content: 'Great! I\'ll see you at the station at 15:30. I\'ll be wearing a blue jacket and carrying a delivery bag.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isFromPicker: true
  }
];

export const mockChatSession: ChatSession = {
  id: 'chat-1',
  pickerId: 'picker-1',
  customerId: 'customer-1',
  deliveryInfo: mockDeliveryInfo,
  messages: mockMessages,
  status: 'active'
};
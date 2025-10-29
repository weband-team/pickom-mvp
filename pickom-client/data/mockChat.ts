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
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock data for multiple chat sessions
export const mockChatSessions: ChatSession[] = [
  {
    id: 'chat-1',
    pickerId: 'picker-1',
    customerId: 'customer-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deliveryInfo: {
      pickupAddress: "Warszawa Central Station",
      dropoffAddress: "Krakowskie Przedmieście 5",
      pickupTime: "Today, 15:30",
      agreedPrice: 25
    },
    messages: [
      {
        id: 'msg-1-1',
        senderId: 'picker-1',
        senderName: 'Adam Kowalski',
        content: 'Great! I\'ll see you at the station at 15:30.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isFromPicker: true
      }
    ],
    status: 'active'
  },
  {
    id: 'chat-2',
    pickerId: 'picker-2',
    customerId: 'customer-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deliveryInfo: {
      pickupAddress: "Galeria Mokotów",
      dropoffAddress: "ul. Nowy Świat 28",
      pickupTime: "Tomorrow, 10:00",
      agreedPrice: 30
    },
    messages: [
      {
        id: 'msg-2-1',
        senderId: 'picker-2',
        senderName: 'Maria Nowak',
        content: 'I confirmed the price at 30 zł. See you tomorrow!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isFromPicker: true
      }
    ],
    status: 'price_confirmed'
  },
  {
    id: 'chat-3',
    pickerId: 'picker-3',
    customerId: 'customer-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deliveryInfo: {
      pickupAddress: "Airport Chopin",
      dropoffAddress: "Plac Zamkowy 4",
      pickupTime: "Jan 28, 14:00",
      agreedPrice: 45
    },
    messages: [
      {
        id: 'msg-3-1',
        senderId: 'picker-3',
        senderName: 'Jan Wiśniewski',
        content: 'Package delivered successfully. Thanks!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isFromPicker: true
      }
    ],
    status: 'completed'
  },
  {
    id: 'chat-4',
    pickerId: 'picker-4',
    customerId: 'customer-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deliveryInfo: {
      pickupAddress: "PKP Warszawa Zachodnia",
      dropoffAddress: "Metro Centrum",
      pickupTime: "Today, 18:00",
      agreedPrice: 20
    },
    messages: [
      {
        id: 'msg-4-1',
        senderId: 'customer-1',
        senderName: 'You',
        content: 'Are you available at 18:00?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isFromPicker: false
      },
      {
        id: 'msg-4-2',
        senderId: 'picker-4',
        senderName: 'Piotr Zieliński',
        content: 'Yes! I can be there. 20 zł works for me.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isFromPicker: true
      }
    ],
    status: 'active'
  },
  {
    id: 'chat-5',
    pickerId: 'picker-5',
    customerId: 'customer-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deliveryInfo: {
      pickupAddress: "Złote Tarasy",
      dropoffAddress: "Dworzec Gdański",
      pickupTime: "Jan 25, 12:00",
      agreedPrice: 35
    },
    messages: [
      {
        id: 'msg-5-1',
        senderId: 'customer-1',
        senderName: 'You',
        content: 'I need to cancel this delivery',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isFromPicker: false
      }
    ],
    status: 'cancelled'
  },
  {
    id: 'chat-6',
    pickerId: 'picker-6',
    customerId: 'customer-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deliveryInfo: {
      pickupAddress: "Blue City Shopping Center",
      dropoffAddress: "University of Warsaw",
      pickupTime: "Tomorrow, 16:30",
      agreedPrice: 28
    },
    messages: [
      {
        id: 'msg-6-1',
        senderId: 'picker-6',
        senderName: 'Anna Lewandowska',
        content: 'Perfect timing! I\'ll pick it up at 16:30 tomorrow.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isFromPicker: true
      },
      {
        id: 'msg-6-2',
        senderId: 'customer-1',
        senderName: 'You',
        content: 'Great, thank you!',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isFromPicker: false
      }
    ],
    status: 'price_confirmed'
  }
];
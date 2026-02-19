export interface Sender {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  totalOrders: number;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  memberSince: string;
}

export const mockSenders: Record<string, Sender> = {
  'sender-1': {
    id: 'sender-1',
    fullName: 'Anna Kowalska',
    email: 'anna.k@example.com',
    avatarUrl: '',
    rating: 4.8,
    totalOrders: 23,
    isPhoneVerified: true,
    isEmailVerified: true,
    memberSince: '2024-01-15',
  },
  'sender-2': {
    id: 'sender-2',
    fullName: 'Jan Nowak',
    email: 'jan.nowak@example.com',
    avatarUrl: '',
    rating: 4.5,
    totalOrders: 12,
    isPhoneVerified: true,
    isEmailVerified: false,
    memberSince: '2024-03-20',
  },
  'sender-3': {
    id: 'sender-3',
    fullName: 'Maria Wiśniewska',
    email: 'maria.w@example.com',
    avatarUrl: '',
    rating: 4.9,
    totalOrders: 45,
    isPhoneVerified: true,
    isEmailVerified: true,
    memberSince: '2023-11-10',
  },
  'sender-4': {
    id: 'sender-4',
    fullName: 'Piotr Lewandowski',
    email: 'p.lewandowski@example.com',
    avatarUrl: '',
    rating: 4.6,
    totalOrders: 8,
    isPhoneVerified: false,
    isEmailVerified: true,
    memberSince: '2024-05-05',
  },
};

export const getSenderById = (id: string): Sender | undefined => {
  return mockSenders[id];
};

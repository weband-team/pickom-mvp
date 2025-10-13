export interface User {
  uid: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'picker' | 'sender';
  prevLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  isOnline?: boolean;
  basePrice?: number;
  rating?: number;
  totalRatings?: number;
  completedDeliveries?: number;
  totalOrders?: number;
  active?: boolean;
}

export interface UserMeResponce {
  user: User;
  message: string;
}
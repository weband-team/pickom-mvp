export interface User {
  id: number;
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
  about?: string;
  bio?: string;
  age?: number;
  country?: string;
  city?: string;
  isVerified?: boolean;
  location?: {
    lat: number;
    lng: number;
    placeId?: string;
  };
}

export interface UserMeResponce {
  user: User;
  message: string;
}
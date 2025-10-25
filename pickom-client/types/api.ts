// Centralized API types for type safety across the application
// Synchronized with backend DTOs

/**
 * User information included in API responses
 * Matches backend UserInfo interface
 */
export interface UserInfo {
  uid: string;
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  rating?: number;
}

/**
 * Location data structure
 */
export interface LocationDto {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  placeId?: string;
}

/**
 * Delivery response from backend API
 * Matches backend DeliveryDto interface
 */
export interface DeliveryResponseDto {
  id: number;
  senderId: string | null;
  pickerId: string | null;
  recipientId?: string | null;
  sender?: UserInfo | null;
  picker?: UserInfo | null;
  recipient?: UserInfo | null;
  title: string;
  description?: string | null;
  fromLocation: LocationDto | null;
  toLocation: LocationDto | null;
  deliveryType?: 'within-city' | 'inter-city';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number | null;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  notes?: string | null;
  deliveriesUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard API error response
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * API response wrapper with data
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * User profile data
 */
export interface UserProfile {
  uid: string;
  id: number;
  email: string;
  name: string;
  phone: string;
  role: 'sender' | 'picker';
  avatarUrl?: string;
  rating?: number;
  totalRatings?: number;
  balance?: number;
  active?: boolean;
  isOnline?: boolean;
  basePrice?: number;
  completedDeliveries?: number;
  totalOrders?: number;
  createdAt: string;
  updatedAt: string;
  prevLoginAt?: string;
  about?: string;
  location?: {
    lat: number;
    lng: number;
    placeId?: string;
  };
}

/**
 * Offer data structure
 */
export interface OfferDto {
  id: number;
  deliveryId: number;
  pickerId: string;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  picker?: UserInfo;
}

/**
 * Rating data structure
 */
export interface RatingDto {
  id: number;
  fromUserId: number;
  toUserId: number;
  deliveryId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

/**
 * Payment data structure
 */
export interface PaymentDto {
  id: number;
  fromUserId: number;
  toUserId: number;
  deliveryId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Notification data structure
 */
export interface NotificationDto {
  id: number;
  userId: number;
  type: 'delivery_update' | 'new_offer' | 'payment' | 'rating' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
}

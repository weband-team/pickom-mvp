export interface Picker {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  trustLevel: number; // 0-100
  price: number; // in rubles
  duration: number; // in minutes
  rating: number; // 1-5
  reviewCount: number;
  isOnline: boolean;
  isVerified: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  distance: number; // in km
  vehicle?: 'car' | 'bike' | 'scooter' | 'walking';
  completedDeliveries: number;
  deliveryCount: number; // alias for completedDeliveries for backwards compatibility
}

export interface PickerFilters {
  maxPrice?: number;
  maxDuration?: number;
  minTrustLevel?: number;
  sortBy: 'price' | 'duration' | 'trust' | 'rating' | 'distance';
  sortOrder: 'asc' | 'desc';
}

export type TrustIndicator = 'high' | 'medium' | 'low';

export function getTrustIndicator(trustLevel: number): TrustIndicator {
  if (trustLevel >= 80) return 'high';
  if (trustLevel >= 50) return 'medium';
  return 'low';
}
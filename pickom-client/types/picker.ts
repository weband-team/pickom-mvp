import { BaseUserData } from './auth'

export interface Picker extends BaseUserData{
  trustLevel: number; 
  price: number; 
  duration: number; 
  reviewCount: number;
  isOnline: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  distance: number; 
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
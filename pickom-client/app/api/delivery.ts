import { AxiosResponse } from 'axios';
import { basicFetch, protectedFetch } from './base';

/**
 * Location interface for delivery addresses
 */
export interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  placeId?: string;
}

/**
 * Delivery Request interfaces
 */
export interface CreateDeliveryRequest {
  title: string;
  description?: string;
  fromLocation: Location;
  toLocation: Location;
  deliveryType?: 'within-city' | 'inter-city';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number;
  notes?: string;
  pickerId?: string;
  recipientId?: string;
  status?: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
}

export interface DeliveryRequest {
  id: number;
  senderId: string;
  pickerId?: string;
  recipientId?: string;
  title: string;
  description?: string;
  fromLocation: Location | null;
  toLocation: Location | null;
  deliveryType?: 'within-city' | 'inter-city';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  senderName?: string;
  senderRating?: number;
}

export interface Picker {
  uid: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  rating?: number;
  phone?: string;
  price?: number; // Added by backend
}

/**
 * Get list of available pickers
 * Public endpoint - no auth required
 */
export const getAvailablePickers = async (): Promise<AxiosResponse<Picker[]>> => {
  return basicFetch.get('/delivery/pickers');
};

/**
 * Create a new delivery request
 * Requires authentication (sender role)
 */
export const createDeliveryRequest = async (
  data: CreateDeliveryRequest
): Promise<AxiosResponse<DeliveryRequest>> => {
  return protectedFetch.post('/delivery/requests', data);
};

/**
 * Get all my delivery requests
 * Requires authentication (sender or picker role)
 * Returns requests based on user role:
 * - Sender: requests created by this user
 * - Picker: requests assigned to this user
 */
export const getMyDeliveryRequests = async (): Promise<AxiosResponse<DeliveryRequest[]>> => {
  return protectedFetch.get('/delivery/requests');
};

/**
 * Get single delivery request by ID
 * Requires authentication (sender or picker role)
 */
export const getDeliveryRequestById = async (
  id: number
): Promise<AxiosResponse<DeliveryRequest>> => {
  return protectedFetch.get(`/delivery/requests/${id}`);
};

/**
 * Update delivery request status
 * Requires authentication (picker role only)
 */
export const updateDeliveryRequestStatus = async (
  id: number,
  status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled'
): Promise<AxiosResponse<DeliveryRequest>> => {
  return protectedFetch.put(`/delivery/requests/${id}/status`, { status });
};

/**
 * Update delivery request data
 * Requires authentication (sender role - owner of delivery)
 * Allows updating any fields: title, description, addresses, price, pickerId, etc.
 */
export const updateDeliveryRequest = async (
  id: number,
  data: Partial<CreateDeliveryRequest>
): Promise<AxiosResponse<DeliveryRequest>> => {
  return protectedFetch.patch(`/delivery/requests/${id}`, data);
};

export const getCompletedDeliveries = async (): Promise<AxiosResponse<DeliveryRequest[]>> => {
  return protectedFetch.get('/delivery/completed');
};

export const getCancelledDeliveries = async (): Promise<AxiosResponse<DeliveryRequest[]>> => {
  return protectedFetch.get('/delivery/cancelled');
};

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Get tracking info for delivery
export const getTracking = async (deliveryId: number) => {
  return api.get(`/traking/${deliveryId}`);
};

// Update picker's current location
export const updatePickerLocation = async (
  deliveryId: number,
  location: { lat: number; lng: number }
) => {
  return api.put(`/traking/${deliveryId}/location`, location);
};

// Get picker's current location (for polling)
export const getPickerLocation = async (deliveryId: number) => {
  return api.get(`/traking/${deliveryId}/location`);
};

// Update tracking status
export const updateTrackingStatus = async (
  deliveryId: number,
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled'
) => {
  return api.put(`/traking/${deliveryId}`, { status });
};

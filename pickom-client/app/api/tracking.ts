import { AxiosResponse } from 'axios';
import { protectedFetch } from './base';

export type DeliveryStatus = 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

export interface TrackingInfo {
  id: number;
  deliveryId: number;
  status: DeliveryStatus;
  currentLocation?: string;
  updatedAt: Date;
}

export interface UpdateTrackingStatusRequest {
  status: DeliveryStatus;
}

export const getTracking = async (deliveryId: number): Promise<AxiosResponse<TrackingInfo>> => {
  return protectedFetch.get(`/traking/${deliveryId}`);
};

export const updateTrackingStatus = async (
  deliveryId: number,
  data: UpdateTrackingStatusRequest
): Promise<AxiosResponse<TrackingInfo>> => {
  return protectedFetch.put(`/traking/${deliveryId}`, data);
};

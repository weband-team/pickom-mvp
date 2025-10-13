import { AxiosResponse } from 'axios';
import { basicFetch, protectedFetch } from './base';

export interface CreateRatingRequest {
  deliveryId: number;
  toUserId: string;
  rating: number;
  comment?: string;
}

export interface Rating {
  id: number;
  deliveryId: number;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export const createRating = async (
  data: CreateRatingRequest
): Promise<AxiosResponse<Rating>> => {
  return protectedFetch.post('/rating', data);
};

export const getRatingsByDelivery = async (
  deliveryId: number
): Promise<AxiosResponse<Rating[]>> => {
  return basicFetch.get(`/rating/delivery/${deliveryId}`);
};

export const getRatingsByUser = async (
  uid: string
): Promise<AxiosResponse<Rating[]>> => {
  return basicFetch.get(`/rating/user/${uid}`);
};

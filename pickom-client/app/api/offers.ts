import { AxiosResponse } from 'axios';
import { protectedFetch } from './base';

export interface Offer {
  id: number;
  deliveryId: number;
  pickerId: string; // Firebase UID
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface CreateOfferRequest {
  deliveryId: number;
  price: number;
  message?: string;
}

export interface UpdateOfferStatusRequest {
  status: 'accepted' | 'rejected';
  paymentMethod?: 'balance' | 'card';
  paymentIntentId?: string;
}

export const createOffer = async (data: CreateOfferRequest): Promise<AxiosResponse<Offer>> => {
  return protectedFetch.post('/offers', data);
};

export const getOffersByDelivery = async (deliveryId: number): Promise<AxiosResponse<Offer[]>> => {
  return protectedFetch.get(`/offers/delivery/${deliveryId}`);
};

export const updateOfferStatus = async (
  offerId: number,
  data: UpdateOfferStatusRequest
): Promise<AxiosResponse<Offer>> => {
  return protectedFetch.patch(`/offers/${offerId}`, data);
};

export const getOfferById = async (offerId: number): Promise<AxiosResponse<Offer>> => {
  return protectedFetch.get(`/offers/${offerId}`);
};

export const getMyOffers = async (): Promise<AxiosResponse<Offer[]>> => {
  return protectedFetch.get('/offers/my');
};

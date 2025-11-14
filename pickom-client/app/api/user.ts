import { protectedFetch } from './base';
import { User } from './dto/user';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  about?: string;
  location?: {
    lat: number;
    lng: number;
    placeId?: string;
  };
}

export const getAllUsers = async (): Promise<{ users: User[] }> => {
  const response = await protectedFetch.get('/user');
  return response.data;
};

export const getUser = async (uid: string): Promise<{ user: User }> => {
  const response = await protectedFetch.get(`/user/${uid}`);
  return response.data;
};

export const updateUser = async (uid: string, userData: UpdateUserRequest) => {
  const response = await protectedFetch.put(`/user/${uid}`, userData);
  return response.data;
};

export const deleteUser = async (uid: string) => {
  const response = await protectedFetch.delete(`/user/${uid}`);
  return response.data;
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await protectedFetch.get('/auth/me');
  return response.data;
};

export const updateOnlineStatus = async (uid: string, isOnline: boolean) => {
  const response = await protectedFetch.put(`/user/${uid}/online-status`, { isOnline });
  return response.data;
};

export const updateBasePrice = async (uid: string, basePrice: number) => {
  const response = await protectedFetch.put(`/user/${uid}/base-price`, { basePrice });
  return response.data;
};

export const getUserBalance = async (uid: string): Promise<{ balance: number }> => {
  const response = await protectedFetch.get(`/user/${uid}/balance`);
  return response.data;
};

export const updateUserLocation = async (
  uid: string,
  location: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    placeId?: string;
  }
) => {
  const response = await protectedFetch.put(`/user/${uid}/location`, { location });
  return response.data;
};
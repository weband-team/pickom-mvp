import { protectedFetch } from './base';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export const updateUser = async (uid: string, userData: UpdateUserRequest) => {
  const response = await protectedFetch.put(`/user/${uid}`, userData);
  return response.data;
};

export const deleteUser = async (uid: string) => {
  const response = await protectedFetch.delete(`/user/${uid}`);
  return response.data;
};
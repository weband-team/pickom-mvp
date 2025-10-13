import { AxiosResponse } from 'axios';
import { basicFetch, protectedFetch } from './base';
import { User, UserMeResponce } from './dto/user';

export const handleLogin = async (accessToken: string): Promise<AxiosResponse<User>> => {
  return basicFetch.post('/auth/login', {}, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
};

export const handleRegister = async (role: string, accessToken: string, phone?: string, name?: string): Promise<AxiosResponse<User>> => {
  return basicFetch.post('/auth/register', { role, phone, name }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
};

export const handleMe = async (): Promise<AxiosResponse<UserMeResponce>> => {
  return protectedFetch.get('/auth/me');
};

export const handleLogout = async (): Promise<AxiosResponse<{ message: string }>> => {
  return protectedFetch.post('/auth/logout');
};
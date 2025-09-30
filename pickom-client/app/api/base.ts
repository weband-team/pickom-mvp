import axios from 'axios';
import { auth } from '../config/firebase-config';

export const protectedFetch = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем interceptor для автоматического добавления Firebase токена
protectedFetch.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const basicFetch = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

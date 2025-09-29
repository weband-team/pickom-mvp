import axios from 'axios';

export const protectedFetch = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const basicFetch = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

import axios from 'axios';
import { auth } from '@/lib/firebase-config';
import { Capacitor } from '@capacitor/core';

// Dynamic API URL based on platform
function getApiUrl(): string {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // For mobile: use NEXT_PUBLIC_SERVER_MOBILE from .env
    // Default: production server (fallback for builds without env vars)
    return process.env.NEXT_PUBLIC_SERVER_MOBILE || 'https://pickom.qirelab.com';
  }

  // Browser environment - use NEXT_PUBLIC_API_URL or NEXT_PUBLIC_SERVER
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER || 'https://pickom.qirelab.com';
}

// Export API_URL so other files can use it
export const API_URL = getApiUrl();

export const protectedFetch = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for automatic Firebase token addition
protectedFetch.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Token error - will be handled by response interceptor
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
protectedFetch.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Silent error handling - can be replaced with error tracking service (Sentry, etc.)
    return Promise.reject(error);
  }
);

export const basicFetch = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for basicFetch
basicFetch.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Test server connectivity
 * Call this on app startup to verify server is reachable
 */
export async function testServerConnection(): Promise<boolean> {
  try {
    await axios.get(`${API_URL}/api`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

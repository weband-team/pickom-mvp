'use client';

import { useEffect, useRef } from 'react';
import { updateUserLocation } from '@/app/api/user';

interface LocationTrackingOptions {
  enabled: boolean;
  userId: string;
  updateInterval?: number; // in milliseconds
}

/**
 * Hook for tracking and updating user location in real-time
 * Uses browser Geolocation API to get current position
 * Automatically updates location on the server
 */
export const useLocationTracking = ({
  enabled,
  userId,
  updateInterval = 3000, // 3 seconds by default
}: LocationTrackingOptions) => {
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !userId) {
      // Stop tracking if disabled or no userId
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();

        // Throttle updates based on updateInterval
        if (now - lastUpdateRef.current < updateInterval) {
          return;
        }

        lastUpdateRef.current = now;

        const { latitude, longitude } = position.coords;

        try {
          // Update location on server
          await updateUserLocation(userId, {
            lat: latitude,
            lng: longitude,
          });

          console.log('Location updated:', { lat: latitude, lng: longitude });
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = watchId;

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, userId, updateInterval]);

  return null;
};

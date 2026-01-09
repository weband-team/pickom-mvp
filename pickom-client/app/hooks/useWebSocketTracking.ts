'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/app/api/auth';
import { Capacitor } from '@capacitor/core';

interface Location {
  lat: number;
  lng: number;
  timestamp: string;
}

interface TrackingData {
  id: number;
  deliveryId: number;
  pickerId: number;
  senderId: number;
  receiverId: number | null;
  fromLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  };
  toLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  };
  pickerLocation: Location | null;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface UseWebSocketTrackingOptions {
  deliveryId: number;
  userId: number;
  enabled: boolean;
  onLocationUpdate?: (location: Location) => void;
  onStatusUpdate?: (status: string) => void;
  onTrackingData?: (data: TrackingData) => void;
  onError?: (error: string) => void;
}

// Dynamic Socket URL based on platform (same logic as base.ts)
function getSocketUrl(): string {
  // Check if running in browser (not SSR)
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER || 'http://localhost:4242';
  }

  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // For mobile: use NEXT_PUBLIC_SERVER_MOBILE from .env
    return process.env.NEXT_PUBLIC_SERVER_MOBILE || 'http://10.0.2.2:4242';
  }

  // Browser environment
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER || 'http://localhost:4242';
}

const MOVING_THRESHOLD = 5; // meters (reduced for testing)

export const useWebSocketTracking = ({
  deliveryId,
  userId,
  enabled,
  onLocationUpdate,
  onStatusUpdate,
  onTrackingData,
  onError,
}: UseWebSocketTrackingOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  // Store callbacks in refs to avoid reconnection on callback change
  const onLocationUpdateRef = useRef(onLocationUpdate);
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onTrackingDataRef = useRef(onTrackingData);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
    onStatusUpdateRef.current = onStatusUpdate;
    onTrackingDataRef.current = onTrackingData;
    onErrorRef.current = onError;
  }, [onLocationUpdate, onStatusUpdate, onTrackingData, onError]);

  // Connect to WebSocket
  useEffect(() => {
    if (!enabled) return;

    const connectSocket = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          onErrorRef.current?.('Authentication token not found');
          return;
        }

        const socketUrl = getSocketUrl();
        const socket = io(`${socketUrl}/tracking`, {
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: `Bearer ${token}`,
              },
            },
          },
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
          console.log('WebSocket connected', socket.id);
          setIsConnected(true);

          // Join tracking room
          socket.emit('join-tracking', { deliveryId, userId });
        });

        socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          onErrorRef.current?.(`Connection error: ${error.message}`);
        });

        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          setIsConnected(false);
        });

        socket.on('tracking-data', (data: TrackingData) => {
          console.log('Received tracking data:', data);
          setTrackingData(data);
          onTrackingDataRef.current?.(data);
        });

        socket.on('location-updated', (data: { deliveryId: number; pickerLocation: Location }) => {
          console.log('Location updated:', data.pickerLocation);
          onLocationUpdateRef.current?.(data.pickerLocation);
          setTrackingData(prev => prev ? { ...prev, pickerLocation: data.pickerLocation } : null);
        });

        socket.on('status-updated', (data: { deliveryId: number; status: string }) => {
          console.log('Status updated:', data.status);
          onStatusUpdateRef.current?.(data.status);
          setTrackingData(prev => prev ? { ...prev, status: data.status as TrackingData['status'] } : null);
        });

        socket.on('tracking-completed', (data: { deliveryId: number }) => {
          console.log('Tracking completed for delivery:', data.deliveryId);
          onStatusUpdateRef.current?.('delivered');
        });

        socket.on('error', (error: { message: string }) => {
          console.error('WebSocket error:', error.message);
          onErrorRef.current?.(error.message);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        onErrorRef.current?.('Failed to connect to tracking server');
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-tracking', { deliveryId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, deliveryId, userId]);

  // Send location update to server
  const sendLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('update-location', {
          deliveryId,
          lat,
          lng,
          userId,
        });
      }
    },
    [deliveryId, userId]
  );

  // Send status update to server
  const sendStatusUpdate = useCallback(
    (status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled') => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('update-status', {
          deliveryId,
          status,
          userId,
        });
      }
    },
    [deliveryId, userId]
  );

  return {
    isConnected,
    trackingData,
    sendLocationUpdate,
    sendStatusUpdate,
  };
};

// Hook specifically for picker to send location updates
export const usePickerLocationTracking = ({
  deliveryId,
  userId,
  enabled,
  onPermissionDenied,
  onPermissionGranted,
}: {
  deliveryId: number;
  userId: number;
  enabled: boolean;
  onPermissionDenied?: () => void;
  onPermissionGranted?: () => void;
}) => {
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const positionCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { sendLocationUpdate, isConnected } = useWebSocketTracking({
    deliveryId,
    userId,
    enabled,
  });

  // Calculate distance between two coordinates
  const calculateDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const EARTH_RADIUS = 6371e3; // Earth radius in meters
      const lat1Rad = (lat1 * Math.PI) / 180;
      const lat2Rad = (lat2 * Math.PI) / 180;
      const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
      const deltaLng = ((lng2 - lng1) * Math.PI) / 180;

      const halfChordLengthSquared =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLengthSquared), Math.sqrt(1 - halfChordLengthSquared));

      return EARTH_RADIUS * angularDistance;
    },
    []
  );

  // Check if user is moving
  const isMoving = useCallback(
    (lat: number, lng: number): boolean => {
      if (!lastLocationRef.current) {
        return true;
      }

      const distance = calculateDistance(
        lastLocationRef.current.lat,
        lastLocationRef.current.lng,
        lat,
        lng
      );

      return distance > MOVING_THRESHOLD;
    },
    [calculateDistance]
  );

  // Function to start watching position
  const startWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        positionCountRef.current += 1;
        const { latitude, longitude } = position.coords;

        // Notify that permission was granted (first successful position)
        if (positionCountRef.current === 1) {
          onPermissionGranted?.();
        }

        const prevLocation = lastLocationRef.current;
        lastLocationRef.current = { lat: latitude, lng: longitude };

        // Determine if moving
        const moving = isMoving(latitude, longitude);

        // Send location update only when position changes
        if (!prevLocation || moving) {
          sendLocationUpdate(latitude, longitude);
        }
      },
      (error) => {
        // Handle permission denied
        if (error.code === error.PERMISSION_DENIED) {
          onPermissionDenied?.();

          // Retry after 10 seconds
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(() => {
            startWatching();
          }, 10000);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = watchId;
  }, [isMoving, sendLocationUpdate, onPermissionDenied]);

  useEffect(() => {
    if (!enabled || !isConnected) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    // Handle page visibility changes to keep tracking in background
    const handleVisibilityChange = () => {
      // Tracking continues in background
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start watching position
    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isConnected, startWatching]);

  return { isConnected, requestLocationPermission: startWatching };
};

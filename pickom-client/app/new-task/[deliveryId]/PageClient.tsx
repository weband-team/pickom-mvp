'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Box, Paper, Typography, Avatar, Chip, CircularProgress, Alert } from '@mui/material';
import { Person, Star, DirectionsCar, Schedule, SignalWifiConnectedNoInternet4, SignalWifi4Bar } from '@mui/icons-material';
import { getDeliveryRequestById, DeliveryRequest } from '@/app/api/delivery';
import { getUser, getCurrentUser } from '@/app/api/user';
import { User } from '@/app/api/dto/user';
import { useWebSocketTracking, usePickerLocationTracking } from '@/app/hooks/useWebSocketTracking';

// Dynamic import to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('./TrackingMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

interface RouteInfo {
  distance: string;
  duration: string;
  coordinates: [number, number][];
}

interface PickerLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  placeId?: string;
}

export default function TrackingPage() {
  const params = useParams();
  const deliveryId = params?.deliveryId as string;

  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [picker, setPicker] = useState<User | null>(null);
  const [pickerLocation, setPickerLocation] = useState<PickerLocation | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Get current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUser();
        setCurrentUser(response.user);
      } catch (err) {
        console.error('Error loading current user:', err);
      }
    };
    loadCurrentUser();
  }, []);

  // Check if current user is the picker
  const isPickerUser = currentUser && picker && currentUser.id === picker.id;

  // Enable location tracking for picker
  usePickerLocationTracking({
    deliveryId: Number(deliveryId),
    userId: currentUser?.id || 0,
    enabled: !!isPickerUser && delivery?.status === 'picked_up',
    onPermissionDenied: () => {
      setHasLocationPermission(false);
    },
    onPermissionGranted: () => {
      setHasLocationPermission(true);
    },
  });

  // WebSocket tracking integration
  const { isConnected } = useWebSocketTracking({
    deliveryId: Number(deliveryId),
    userId: currentUser?.id || 0,
    enabled: !!currentUser && !!delivery,
    onLocationUpdate: (location) => {
      console.log('Picker location updated via WebSocket:', location);
      setPickerLocation({
        lat: location.lat,
        lng: location.lng,
      });
    },
    onStatusUpdate: (status) => {
      console.log('Delivery status updated via WebSocket:', status);
      if (delivery) {
        setDelivery({ ...delivery, status: status as DeliveryRequest['status'] });
      }
    },
    onTrackingData: (data) => {
      console.log('Received full tracking data:', data);
      if (data.pickerLocation) {
        setPickerLocation({
          lat: data.pickerLocation.lat,
          lng: data.pickerLocation.lng,
        });
      }
    },
    onError: (errorMsg) => {
      console.error('WebSocket error:', errorMsg);
      setError(errorMsg);
    },
  });

  // Load delivery data
  useEffect(() => {
    const loadDelivery = async () => {
      try {
        setLoading(true);
        const response = await getDeliveryRequestById(Number(deliveryId));
        setDelivery(response.data);

        // Load picker data if exists
        if (response.data.pickerId) {
          const pickerResponse = await getUser(response.data.pickerId);
          setPicker(pickerResponse.user);

          // Set initial picker location
          if (pickerResponse.user.location) {
            setPickerLocation(pickerResponse.user.location);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading delivery:', err);
        setError((err as Error).message || 'Failed to load delivery information');
        setLoading(false);
      }
    };

    loadDelivery();
  }, [deliveryId]);

  // Calculate route using OSRM API
  const calculateRoute = async (from: PickerLocation, to: { lat: number; lng: number }) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        // Fallback to direct line
        return {
          distance: 'N/A',
          duration: 'N/A',
          coordinates: [[from.lat, from.lng], [to.lat, to.lng]] as [number, number][]
        };
      }

      const routeData = data.routes[0];
      const coordinates: [number, number][] = routeData.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]] // OSRM returns [lng, lat], we need [lat, lng]
      );

      return {
        distance: `${(routeData.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(routeData.duration / 60)} min`,
        coordinates
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      // Fallback to direct line
      return {
        distance: 'N/A',
        duration: 'N/A',
        coordinates: [[from.lat, from.lng], [to.lat, to.lng]] as [number, number][]
      };
    }
  };

  // Calculate route when picker location changes (via WebSocket)
  useEffect(() => {
    if (!pickerLocation || !delivery?.toLocation) return;

    const updateRoute = async () => {
      try {
        const newRoute = await calculateRoute(pickerLocation, delivery.toLocation!);
        setRoute(newRoute);
      } catch (err) {
        console.error('Error calculating route:', err);
      }
    };

    updateRoute();
  }, [pickerLocation, delivery?.toLocation]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'picked_up': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !delivery) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error || 'Delivery not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5">
            Delivery Tracking
          </Typography>
          <Chip
            icon={
              isConnected && (hasLocationPermission || !isPickerUser)
                ? <SignalWifi4Bar />
                : <SignalWifiConnectedNoInternet4 />
            }
            label={
              isConnected && (hasLocationPermission || !isPickerUser)
                ? 'Live Tracking'
                : isConnected && !hasLocationPermission && isPickerUser
                ? 'Permission Denied'
                : 'Connecting...'
            }
            color={
              isConnected && (hasLocationPermission || !isPickerUser)
                ? 'success'
                : isConnected && !hasLocationPermission && isPickerUser
                ? 'error'
                : 'default'
            }
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={delivery.status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(delivery.status) as 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'}
            size="small"
          />
          {route && (
            <>
              <Chip
                icon={<DirectionsCar />}
                label={`Distance: ${route.distance}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<Schedule />}
                label={`ETA: ${route.duration}`}
                size="small"
                variant="outlined"
              />
            </>
          )}
        </Box>
      </Paper>

      {/* Map */}
      <Paper sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
        <TrackingMap
          delivery={delivery}
          picker={picker}
          pickerLocation={pickerLocation}
          route={route}
        />
      </Paper>

      {/* Delivery Info */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {delivery.title}
        </Typography>
        {delivery.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {delivery.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Size</Typography>
            <Typography variant="body2" fontWeight={600}>{delivery.size}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Price</Typography>
            <Typography variant="body2" fontWeight={600}>${delivery.price}</Typography>
          </Box>
          {delivery.weight && (
            <Box>
              <Typography variant="caption" color="text.secondary">Weight</Typography>
              <Typography variant="body2" fontWeight={600}>{delivery.weight} kg</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Picker Info */}
      {picker && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            <Person /> Courier Information
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar src={picker.avatarUrl} sx={{ width: 60, height: 60 }}>
              {picker.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600}>{picker.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star fontSize="small" sx={{ color: 'gold' }} />
                <Typography variant="body2">
                  {picker.rating ? Number(picker.rating).toFixed(1) : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({picker.totalRatings || 0} ratings)
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {picker.completedDeliveries || 0} completed deliveries
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Chat,
  Star,
  Phone,
  Navigation,
  Check,
  Circle,
  RadioButtonChecked
} from '@mui/icons-material';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { Button } from '@/components/ui';
import { getDeliveryRequestById, DeliveryRequest } from '@/app/api/delivery';
import { getUser, getCurrentUser } from '@/app/api/user';
import { User } from '@/app/api/dto/user';
import { useWebSocketTracking, usePickerLocationTracking } from '@/app/hooks/useWebSocketTracking';
import { format } from 'date-fns';

// Dynamic import to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('./TrackingMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
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
  timestamp?: string;
}

export default function TrackDeliveryPage({ params }: { params: Promise<{ deliveryId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const deliveryId = resolvedParams?.deliveryId;

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
  const isSender = currentUser && delivery && currentUser.uid === delivery.senderId;

  // Enable location tracking for picker
  usePickerLocationTracking({
    deliveryId: Number(deliveryId),
    userId: currentUser?.id || 0,
    enabled: !!isPickerUser && (delivery?.status === 'picked_up' || delivery?.status === 'accepted'),
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
        timestamp: location.timestamp,
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
          timestamp: data.pickerLocation.timestamp,
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
        setError('Failed to load delivery information');
        setLoading(false);
      }
    };

    if (deliveryId) {
      loadDelivery();
    }
  }, [deliveryId]);

  // Calculate route using OSRM API
  const calculateRoute = async (from: PickerLocation, to: { lat: number; lng: number }) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        return {
          distance: 'N/A',
          duration: 'N/A',
          coordinates: [[from.lat, from.lng], [to.lat, to.lng]] as [number, number][]
        };
      }

      const routeData = data.routes[0];
      const coordinates: [number, number][] = routeData.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]]
      );

      return {
        distance: `${(routeData.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(routeData.duration / 60)} min`,
        coordinates
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      return {
        distance: 'N/A',
        duration: 'N/A',
        coordinates: [[from.lat, from.lng], [to.lat, to.lng]] as [number, number][]
      };
    }
  };

  // Calculate route when picker location changes
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

  const handleChat = async () => {
    if (!picker) return;
    try {
      const { createChat } = await import('@/app/api/chat');
      const response = await createChat({
        participantId: picker.uid,
        deliveryId: parseInt(deliveryId),
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  const handleNavigate = () => {
    if (!delivery?.toLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.toLocation.lat},${delivery.toLocation.lng}`;
    window.open(url, '_blank');
  };

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

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <MobileContainer showFrame={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </MobileContainer>
    );
  }

  if (error || !delivery) {
    return (
      <MobileContainer showFrame={false}>
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error || 'Delivery not found'}</Alert>
          <Button variant="outlined" onClick={() => router.back()} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Box>
      </MobileContainer>
    );
  }

  const trackingNumber = `PCK${delivery.id.toString().padStart(6, '0')}`;
  const showLiveIndicator = isConnected && (delivery.status === 'picked_up' || delivery.status === 'accepted') && pickerLocation;

  return (
    <MobileContainer showFrame={false}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'background.default' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            boxShadow: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
                Track Delivery
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {trackingNumber}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={getStatusLabel(delivery.status)}
              color={getStatusColor(delivery.status) as any}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {showLiveIndicator && (
              <Chip
                label="Live"
                size="small"
                sx={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontWeight: 600,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                    '100%': { opacity: 1 },
                  },
                }}
                icon={<RadioButtonChecked sx={{ fontSize: 16, color: 'white !important' }} />}
              />
            )}
          </Stack>
        </Box>

        {/* Map */}
        <Box sx={{ height: '60vh', position: 'relative' }}>
          <TrackingMap
            delivery={delivery}
            picker={picker}
            pickerLocation={pickerLocation}
            route={route}
          />

          {/* ETA Floating Card */}
          {route && pickerLocation && delivery.status === 'picked_up' && (
            <Card
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                px: 2,
                py: 1,
                boxShadow: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">ETA</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{route.duration}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="caption" color="text.secondary">Distance</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{route.distance}</Typography>
                </Box>
              </Stack>
            </Card>
          )}
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, pb: 10 }}>
          {/* Timeline */}
          <Card sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Delivery Progress
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {delivery.status === 'accepted' || delivery.status === 'picked_up' || delivery.status === 'delivered' ? (
                  <Check sx={{ color: 'success.main', fontSize: 28 }} />
                ) : (
                  <Circle sx={{ color: 'text.disabled', fontSize: 20 }} />
                )}
                <Typography variant="caption" sx={{ mt: 0.5, fontWeight: delivery.status === 'accepted' ? 600 : 400 }}>
                  Accepted
                </Typography>
                {delivery.createdAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {format(new Date(delivery.createdAt), 'HH:mm')}
                  </Typography>
                )}
              </Box>

              <Box sx={{ height: 2, flex: 1, backgroundColor: delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'success.main' : 'divider' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {delivery.status === 'picked_up' || delivery.status === 'delivered' ? (
                  <Check sx={{ color: 'success.main', fontSize: 28 }} />
                ) : (
                  <Circle sx={{ color: 'text.disabled', fontSize: 20 }} />
                )}
                <Typography variant="caption" sx={{ mt: 0.5, fontWeight: delivery.status === 'picked_up' ? 600 : 400 }}>
                  Picked Up
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {delivery.status === 'picked_up' || delivery.status === 'delivered' ? format(new Date(), 'HH:mm') : 'Pending'}
                </Typography>
              </Box>

              <Box sx={{ height: 2, flex: 1, backgroundColor: delivery.status === 'delivered' ? 'success.main' : 'divider' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {delivery.status === 'delivered' ? (
                  <Check sx={{ color: 'success.main', fontSize: 28 }} />
                ) : (
                  <Circle sx={{ color: 'text.disabled', fontSize: 20 }} />
                )}
                <Typography variant="caption" sx={{ mt: 0.5, fontWeight: delivery.status === 'delivered' ? 600 : 400 }}>
                  Delivered
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {route?.duration || 'Est.'}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Picker Info */}
          {picker && (
            <Card sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                {isPickerUser ? 'You are the Picker' : 'Courier Information'}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={picker.avatarUrl} sx={{ width: 56, height: 56 }}>
                  {picker.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {picker.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                    <Typography variant="body2" color="text.secondary">
                      {picker.rating ? Number(picker.rating).toFixed(1) : 'N/A'} ({picker.totalRatings || 0})
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {picker.completedDeliveries || 0} completed deliveries
                  </Typography>
                </Box>
              </Stack>

              {!isPickerUser && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Chat />}
                    onClick={handleChat}
                  >
                    Chat
                  </Button>
                  {picker.phone && (
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<Phone />}
                      onClick={() => window.open(`tel:${picker.phone}`, '_self')}
                    >
                      Call
                    </Button>
                  )}
                </Stack>
              )}

              {isPickerUser && delivery.status === 'accepted' && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<Navigation />}
                    onClick={handleNavigate}
                  >
                    Navigate
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Chat />}
                    onClick={handleChat}
                  >
                    Chat
                  </Button>
                </Stack>
              )}
            </Card>
          )}

          {/* Delivery Details */}
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Package Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">From</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {delivery.fromLocation?.address || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">To</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {delivery.toLocation?.address || 'N/A'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Size</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {delivery.size}
                </Typography>
              </Box>
              {delivery.weight && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {delivery.weight} kg
                  </Typography>
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Price</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  ${delivery.price}
                </Typography>
              </Box>
            </Stack>

            {delivery.description && (
              <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2">{delivery.description}</Typography>
              </Box>
            )}
          </Card>
        </Box>

        {/* Bottom Actions */}
        {isSender && delivery.status === 'delivered' && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              backgroundColor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              boxShadow: 3,
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push(`/rate-picker/${delivery.id}`)}
              startIcon={<Star />}
            >
              Rate Picker
            </Button>
          </Box>
        )}
      </Box>
    </MobileContainer>
  );
}

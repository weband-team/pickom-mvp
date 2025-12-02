'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  SwipeableDrawer,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  LocalShipping,
  CalendarToday,
  AttachMoney,
  Chat,
  LocalOffer,
  CheckCircle,
  Cancel,
  LocalShippingOutlined,
  Star,
  Close,
  Schedule,
  DirectionsCar,
  Done,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getDeliveryRequestById, updateDeliveryRequestStatus } from '@/app/api/delivery';
import { createOffer } from '@/app/api/offers';
import { getUser, getCurrentUser } from '@/app/api/user';
import SenderCard, { SenderCardData } from '@/components/sender/SenderCard';
import ReceiverCard from '@/components/order/ReceiverCard';
import { createChat } from '@/app/api/chat';
import { getPickerLocation, updatePickerLocation } from '@/app/api/tracking';
import dynamic from 'next/dynamic';

// Lazy load map component to avoid SSR issues
const DeliveryTrackingMap = dynamic(
  () => import('@/components/tracking/DeliveryTrackingMap'),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
        <CircularProgress size={24} />
      </Box>
    ),
  }
);

interface DeliveryRequest {
  id: number;
  senderId: string;
  pickerId?: string;
  recipientId?: number;
  recipientPhone?: string;
  title: string;
  description?: string;
  fromAddress: string;
  toAddress: string;
  fromLocation?: { lat: number; lng: number };
  toLocation?: { lat: number; lng: number };
  pickerLocation?: { lat: number; lng: number };
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number;
  notes?: string;
  deliveryType?: 'within-city' | 'inter-city';
  packageType?: string;
  packageDescription?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface PickerCardData {
  uid: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  completedDeliveries: number;
  phone?: string;
}

interface ReceiverCardData {
  uid: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

export default function DeliveryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [sender, setSender] = useState<SenderCardData | null>(null);
  const [picker, setPicker] = useState<PickerCardData | null>(null);
  const [receiver, setReceiver] = useState<ReceiverCardData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'sender' | 'picker' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  // Make Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerMessage, setOfferMessage] = useState('');
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);

  // Dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [nextStatus, setNextStatus] = useState<'picked_up' | 'delivered' | null>(null);

  // Tracking state
  const [pickerLocation, setPickerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      setLoading(true);
      setError('');

      try {
        // Get current user
        const currentUserResponse = await getCurrentUser();
        setCurrentUser(currentUserResponse.user);
        setUserRole(currentUserResponse.user.role);

        // Get delivery
        const response = await getDeliveryRequestById(Number(resolvedParams.id));
        const deliveryData = response.data;
        setDelivery(deliveryData as any);

        // Fetch sender data
        try {
          const senderResponse = await getUser(deliveryData.senderId);
          const senderUser = senderResponse.user;

          if (senderUser) {
            const senderData: SenderCardData = {
              uid: senderUser.uid,
              fullName: senderUser.name,
              avatarUrl: senderUser.avatarUrl,
              rating: 4.8,
              totalOrders: 45,
              isPhoneVerified: senderUser.phone ? true : false,
              isEmailVerified: true,
              memberSince: senderUser.createdAt,
              phone: senderUser.phone,
              email: senderUser.email,
            };
            setSender(senderData);
          }
        } catch {        }

        // Fetch picker data if assigned
        if (deliveryData.pickerId) {
          try {
            const pickerResponse = await getUser(deliveryData.pickerId);
            const pickerUser = pickerResponse.user;

            if (pickerUser) {
              const pickerData: PickerCardData = {
                uid: pickerUser.uid,
                fullName: pickerUser.name,
                avatarUrl: pickerUser.avatarUrl,
                rating: 4.5,
                completedDeliveries: 100,
                phone: pickerUser.phone,
              };
              setPicker(pickerData);
            }
          } catch {          }
        }

        // Fetch receiver data if assigned
        if (deliveryData.recipientId) {
          try {
            const receiverResponse = await getUser(String(deliveryData.recipientId));
            const receiverUser = receiverResponse.user;

            if (receiverUser) {
              const receiverData: ReceiverCardData = {
                uid: receiverUser.uid,
                fullName: receiverUser.name,
                avatarUrl: receiverUser.avatarUrl,
                rating: receiverUser.rating || 0,
                isPhoneVerified: receiverUser.phone ? true : false,
                isEmailVerified: true,
              };
              setReceiver(receiverData);
            }
          } catch {          }
        }
      } catch {        setError('Failed to load delivery details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [resolvedParams.id]);

  // Find mobile container for modals
  useEffect(() => {
    const mobileContainer = document.querySelector('[data-mobile-container]') as HTMLElement;
    setModalContainer(mobileContainer);
  }, []);

  // Polling for picker location (for sender/receiver)
  useEffect(() => {
    if (!delivery || !userRole) return;

    // Only poll for active deliveries
    if (delivery.status !== 'accepted' && delivery.status !== 'picked_up') return;

    // Sender/receiver polls for picker location
    if (userRole === 'sender') {
      const pollLocation = async () => {
        try {
          const response = await getPickerLocation(delivery.id);
          if (response.data.pickerLocation) {
            setPickerLocation({
              lat: response.data.pickerLocation.lat,
              lng: response.data.pickerLocation.lng,
            });
            setLastLocationUpdate(new Date());
          }
        } catch (err) {
          console.error('Failed to fetch picker location:', err);
        }
      };

      // Initial fetch
      pollLocation();

      // Poll every 15 seconds
      const intervalId = setInterval(pollLocation, 15000);
      return () => clearInterval(intervalId);
    }
  }, [delivery, userRole]);

  // Send picker's geolocation (for picker with active delivery)
  useEffect(() => {
    if (!delivery || userRole !== 'picker') return;

    // Only track for active deliveries where this picker is assigned
    if (delivery.status !== 'accepted' && delivery.status !== 'picked_up') return;
    if (delivery.pickerId !== currentUser?.uid) return;

    let watchId: number | null = null;

    const startTracking = () => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          try {
            await updatePickerLocation(delivery.id, location);
            setPickerLocation(location);
            setLastLocationUpdate(new Date());
          } catch (err) {
            console.error('Failed to update location:', err);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [delivery, userRole, currentUser]);

  const handleBack = () => {
    if (userRole === 'sender') {
      router.push('/delivery-methods?tab=manage');
    } else {
      router.push('/available-deliveries');
    }
  };

  const handleChat = async (userId: string) => {
    try {
      const response = await createChat({
        participantId: userId,
        deliveryId: delivery?.id,
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch {      alert('Failed to open chat. Please try again.');
    }
  };

  const handleChatWithReceiver = async () => {
    if (!receiver) return;

    try {
      const response = await createChat({
        participantId: receiver.uid,
        deliveryId: delivery?.id,
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch {      alert('Failed to open chat. Please try again.');
    }
  };

  const handleMakeOffer = () => {
    setOfferPrice(delivery?.price || 0);
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async () => {
    if (!delivery) return;

    setActionLoading(true);

    try {
      await createOffer({
        deliveryId: delivery.id,
        price: offerPrice,
        message: offerMessage || undefined,
      });

      alert('Offer submitted successfully!');
      setShowOfferModal(false);
      setOfferPrice(0);
      setOfferMessage('');
    } catch {      alert('Failed to submit offer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDelivery = async () => {
    if (!delivery) return;

    setActionLoading(true);

    try {
      await updateDeliveryRequestStatus(delivery.id, 'cancelled');
      alert('Delivery cancelled successfully');
      setShowCancelDialog(false);
      router.push('/delivery-methods?tab=manage');
    } catch {      alert('Failed to cancel delivery. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'picked_up' | 'delivered') => {
    setNextStatus(status);
    setShowStatusDialog(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!delivery || !nextStatus) return;

    setActionLoading(true);

    try {
      await updateDeliveryRequestStatus(delivery.id, nextStatus);
      setDelivery({ ...delivery, status: nextStatus });
      alert(`Status updated to ${nextStatus === 'picked_up' ? 'Picked Up' : 'Delivered'}!`);
      setShowStatusDialog(false);
      setNextStatus(null);

      if (nextStatus === 'delivered' && isPicker) {
        router.push(`/rate-sender/${delivery.id}`);
      }
    } catch {      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
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
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Puller component for swipe-down gesture
  const Puller = () => (
    <Box
      sx={{
        width: 40,
        height: 4,
        backgroundColor: 'action.disabled',
        borderRadius: 2,
        position: 'absolute',
        top: 8,
        left: 'calc(50% - 20px)',
      }}
    />
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !delivery) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 375 }}>
          {error || 'Delivery not found'}
        </Alert>
      </Box>
    );
  }

  const isSender = userRole === 'sender';
  const isPicker = userRole === 'picker';
  const isAssignedPicker = isPicker && delivery.pickerId === currentUser?.uid;

  return (
    <>
      <MobileContainer showFrame={false}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: 'background.default',
          }}
        >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <IconButton onClick={handleBack} size="small">
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                Delivery #{delivery.id}
              </Typography>
              <Chip
                label={getStatusLabel(delivery.status)}
                size="small"
                color={getStatusColor(delivery.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                pb: 2,
              }}
            >
              {/* Route Details */}
              <Card sx={{ m: 2, boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Route Details
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <LocationOn sx={{ color: 'success.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Pickup
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {delivery.fromAddress}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <LocationOn sx={{ color: 'error.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Dropoff
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {delivery.toAddress}
                      </Typography>
                    </Box>
                  </Box>

                  {delivery.packageDescription && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                      <LocalShipping sx={{ color: 'text.secondary', mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Package
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {delivery.packageDescription}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney sx={{ color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {delivery.price} zł
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Delivery Timeline */}
              <Card sx={{ m: 2, boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Delivery Progress
                  </Typography>

                  <Box sx={{ position: 'relative', pl: 3 }}>
                    {/* Timeline line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 11,
                        top: 12,
                        bottom: 12,
                        width: 2,
                        bgcolor: 'divider',
                      }}
                    />

                    {/* Pending */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -19,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: delivery.status !== 'cancelled' ? 'success.main' : 'grey.400',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Done sx={{ fontSize: 14, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Created
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(delivery.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Accepted */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -19,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: ['accepted', 'picked_up', 'delivered'].includes(delivery.status) ? 'success.main' : 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {['accepted', 'picked_up', 'delivered'].includes(delivery.status) ? (
                          <Done sx={{ fontSize: 14, color: 'white' }} />
                        ) : (
                          <Schedule sx={{ fontSize: 14, color: 'grey.500' }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: ['accepted', 'picked_up', 'delivered'].includes(delivery.status) ? 600 : 400, color: ['accepted', 'picked_up', 'delivered'].includes(delivery.status) ? 'text.primary' : 'text.secondary' }}>
                          Accepted by Picker
                        </Typography>
                        {['accepted', 'picked_up', 'delivered'].includes(delivery.status) && (
                          <Typography variant="caption" color="text.secondary">
                            Picker assigned
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Picked Up */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -19,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: ['picked_up', 'delivered'].includes(delivery.status) ? 'success.main' : 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {['picked_up', 'delivered'].includes(delivery.status) ? (
                          <Done sx={{ fontSize: 14, color: 'white' }} />
                        ) : (
                          <LocalShipping sx={{ fontSize: 14, color: 'grey.500' }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: ['picked_up', 'delivered'].includes(delivery.status) ? 600 : 400, color: ['picked_up', 'delivered'].includes(delivery.status) ? 'text.primary' : 'text.secondary' }}>
                          Picked Up
                        </Typography>
                        {['picked_up', 'delivered'].includes(delivery.status) && (
                          <Typography variant="caption" color="text.secondary">
                            Package collected
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* In Transit */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -19,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: delivery.status === 'picked_up' ? 'primary.main' : delivery.status === 'delivered' ? 'success.main' : 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {delivery.status === 'delivered' ? (
                          <Done sx={{ fontSize: 14, color: 'white' }} />
                        ) : delivery.status === 'picked_up' ? (
                          <DirectionsCar sx={{ fontSize: 14, color: 'white' }} />
                        ) : (
                          <DirectionsCar sx={{ fontSize: 14, color: 'grey.500' }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: delivery.status === 'picked_up' || delivery.status === 'delivered' ? 600 : 400, color: delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'text.primary' : 'text.secondary' }}>
                          In Transit
                        </Typography>
                        {delivery.status === 'picked_up' && (
                          <Typography variant="caption" color="primary.main">
                            On the way...
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Delivered */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -19,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: delivery.status === 'delivered' ? 'success.main' : 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {delivery.status === 'delivered' ? (
                          <CheckCircle sx={{ fontSize: 14, color: 'white' }} />
                        ) : (
                          <CheckCircle sx={{ fontSize: 14, color: 'grey.500' }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: delivery.status === 'delivered' ? 600 : 400, color: delivery.status === 'delivered' ? 'success.main' : 'text.secondary' }}>
                          Delivered
                        </Typography>
                        {delivery.status === 'delivered' && (
                          <Typography variant="caption" color="success.main">
                            Package delivered!
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Cancelled status */}
                    {delivery.status === 'cancelled' && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2, position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -19,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Cancel sx={{ fontSize: 14, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                            Cancelled
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Delivery was cancelled
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Live Tracking Map */}
              {(delivery.status === 'accepted' || delivery.status === 'picked_up') && (
                <Card sx={{ m: 2, boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Live Tracking
                    </Typography>
                    <DeliveryTrackingMap
                      pickupLocation={delivery.fromLocation}
                      dropoffLocation={delivery.toLocation}
                      pickerLocation={pickerLocation || delivery.pickerLocation}
                      pickerName={picker?.fullName}
                      status={delivery.status}
                      userRole={userRole}
                      fromAddress={delivery.fromAddress}
                      toAddress={delivery.toAddress}
                    />
                    {lastLocationUpdate && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                        Last updated: {lastLocationUpdate.toLocaleTimeString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sender/Picker Info Cards */}
              {isSender && picker && (
                <Box sx={{ m: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Picker Information
                  </Typography>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="h5">{picker.fullName[0]}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {picker.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ⭐ {picker.rating} • {picker.completedDeliveries} deliveries
                          </Typography>
                        </Box>
                        <IconButton onClick={() => handleChat(picker.uid)}>
                          <Chat />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {isPicker && sender && (
                <Box sx={{ m: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Sender Information
                  </Typography>
                  <SenderCard sender={sender} variant="full" />
                </Box>
              )}

              {isPicker && (receiver || delivery?.recipientPhone) && (
                <Box sx={{ m: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Receiver Information
                  </Typography>
                  <ReceiverCard
                    receiver={{
                      recipientId: receiver?.uid,
                      recipientPhone: delivery?.recipientPhone,
                      recipientUser: receiver ? {
                        uid: receiver.uid,
                        fullName: receiver.fullName,
                        avatarUrl: receiver.avatarUrl,
                        rating: receiver.rating,
                        isPhoneVerified: receiver.isPhoneVerified,
                        isEmailVerified: receiver.isEmailVerified,
                      } : undefined,
                    }}
                    onContactClick={receiver ? handleChatWithReceiver : undefined}
                    variant="compact"
                  />
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                p: 2,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                pb: 8,
              }}
            >
              <Stack spacing={1.5}>
                {/* Sender actions */}
                {isSender && delivery.status === 'pending' && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => router.push(`/delivery-methods/${delivery.id}/offers`)}
                      fullWidth
                      startIcon={<LocalOffer />}
                    >
                      View Offers
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setShowCancelDialog(true)}
                      fullWidth
                      startIcon={<Cancel />}
                    >
                      Cancel Delivery
                    </Button>
                  </>
                )}

                {isSender && (delivery.status === 'accepted' || delivery.status === 'picked_up') && picker && (
                  <Button
                    variant="outlined"
                    onClick={() => handleChat(picker.uid)}
                    fullWidth
                    startIcon={<Chat />}
                  >
                    Chat with Picker
                  </Button>
                )}

                {isSender && delivery.status === 'delivered' && picker && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push(`/rate-picker/${delivery.id}`)}
                    fullWidth
                    startIcon={<Star />}
                  >
                    Rate Picker
                  </Button>
                )}

                {/* Picker actions - not assigned */}
                {isPicker && !isAssignedPicker && delivery.status === 'pending' && (
                  <>
                    {sender && (
                      <Button
                        variant="outlined"
                        onClick={() => handleChat(sender.uid)}
                        fullWidth
                        startIcon={<Chat />}
                      >
                        Chat with Sender
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleMakeOffer}
                      fullWidth
                      startIcon={<LocalOffer />}
                    >
                      Make an Offer
                    </Button>
                  </>
                )}

                {/* Picker actions - assigned */}
                {isAssignedPicker && delivery.status === 'accepted' && (
                  <>
                    {sender && (
                      <Button
                        variant="outlined"
                        onClick={() => handleChat(sender.uid)}
                        fullWidth
                        startIcon={<Chat />}
                      >
                        Chat with Sender
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUpdateStatus('picked_up')}
                      fullWidth
                      startIcon={<LocalShippingOutlined />}
                    >
                      Mark as Picked Up
                    </Button>
                  </>
                )}

                {isAssignedPicker && delivery.status === 'picked_up' && (
                  <>
                    {sender && (
                      <Button
                        variant="outlined"
                        onClick={() => handleChat(sender.uid)}
                        fullWidth
                        startIcon={<Chat />}
                      >
                        Chat with Sender
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleUpdateStatus('delivered')}
                      fullWidth
                      startIcon={<CheckCircle />}
                    >
                      Mark as Delivered
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
        </Box>
      </MobileContainer>
      <BottomNavigation />

      {/* Make Offer Modal */}
      <SwipeableDrawer
          anchor="bottom"
          open={showOfferModal}
          onClose={() => !actionLoading && setShowOfferModal(false)}
          onOpen={() => {}}
          disableSwipeToOpen
          disablePortal
          container={modalContainer}
          ModalProps={{
            keepMounted: false,
          }}
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              maxWidth: '375px',
              margin: '0 auto',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Puller />

          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            pt: 3,
            pb: 1
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Make an Offer
            </Typography>
            <IconButton
              onClick={() => setShowOfferModal(false)}
              size="small"
              disabled={actionLoading}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ px: 3, pb: 2, overflowY: 'auto' }}>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current price: <strong>{delivery.price} zł</strong>
              </Typography>
              <TextField
                label="Your Price (zł)"
                type="number"
                fullWidth
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                sx={{ mb: 2 }}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={actionLoading}
              />
              <TextField
                label="Message (optional)"
                multiline
                rows={3}
                fullWidth
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Add a message to the sender..."
                disabled={actionLoading}
              />
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
          }}>
            <Button
              onClick={() => setShowOfferModal(false)}
              disabled={actionLoading}
              variant="outlined"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOffer}
              variant="contained"
              disabled={actionLoading || offerPrice <= 0}
              fullWidth
            >
              {actionLoading ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </Box>
        </SwipeableDrawer>

        {/* Cancel Dialog */}
        <Dialog
          open={showCancelDialog}
          onClose={() => !actionLoading && setShowCancelDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Cancel Delivery?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Are you sure you want to cancel delivery #{delivery.id}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCancelDialog(false)} disabled={actionLoading}>
              No
            </Button>
            <Button
              onClick={handleCancelDelivery}
              variant="contained"
              color="error"
              disabled={actionLoading}
            >
              {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog
          open={showStatusDialog}
          onClose={() => !actionLoading && setShowStatusDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Update Status?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Mark delivery as {nextStatus === 'picked_up' ? 'Picked Up' : 'Delivered'}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowStatusDialog(false); setNextStatus(null); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusUpdate}
              variant="contained"
              color={nextStatus === 'delivered' ? 'success' : 'primary'}
              disabled={actionLoading}
            >
              {actionLoading ? 'Updating...' : 'Confirm'}
            </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

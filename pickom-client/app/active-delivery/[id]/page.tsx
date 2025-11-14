'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  LocalShipping,
  AttachMoney,
  Chat,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import SenderCard, { SenderCardData } from '@/components/sender/SenderCard';
import { getDeliveryRequestById, updateDeliveryRequestStatus } from '@/app/api/delivery';
import { getUser, getCurrentUser } from '@/app/api/user';
import { usePickerLocationTracking } from '@/app/hooks/useWebSocketTracking';

interface DeliveryRequest {
  id: number;
  senderId: string;
  pickerId?: string;
  title: string;
  description?: string;
  fromAddress: string;
  toAddress: string;
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function ActiveDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const deliveryId = Number(resolvedParams.id);

  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [sender, setSender] = useState<SenderCardData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Enable WebSocket location tracking when status is 'picked_up'
  const { isConnected } = usePickerLocationTracking({
    deliveryId,
    userId: currentUserId,
    enabled: delivery?.status === 'picked_up' && !!currentUserId,
  });

  // Log connection status
  useEffect(() => {
    console.log('[ActiveDelivery] WebSocket connection status:', {
      isConnected,
      deliveryId,
      userId: currentUserId,
      deliveryStatus: delivery?.status,
      enabled: delivery?.status === 'picked_up' && !!currentUserId,
    });
  }, [isConnected, deliveryId, currentUserId, delivery?.status]);

  // Status update dialog
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    newStatus: 'picked_up' | 'delivered' | null;
  }>({
    open: false,
    newStatus: null,
  });
  const [updating, setUpdating] = useState(false);

  // Fetch delivery and sender data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Get current user for location tracking
        const currentUserResponse = await getCurrentUser();
        setCurrentUserId(currentUserResponse.user.id);

        const deliveryResponse = await getDeliveryRequestById(deliveryId);
        const deliveryData = deliveryResponse.data;
        setDelivery(deliveryData as any);

        // Fetch sender data
        const senderResponse = await getUser(deliveryData.senderId);
        const senderUser = senderResponse.user;

        const senderData: SenderCardData = {
          uid: senderUser.uid,
          fullName: senderUser.name,
          avatarUrl: senderUser.avatarUrl,
          rating: 4.8, // TODO: Get from backend
          totalOrders: 45, // TODO: Get from backend
          isPhoneVerified: senderUser.phone ? true : false,
          isEmailVerified: true,
          memberSince: senderUser.createdAt,
          phone: senderUser.phone,
          email: senderUser.email,
        };

        setSender(senderData);
      } catch (err: any) {
        console.error('Failed to fetch delivery:', err);
        setError('Failed to load delivery details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliveryId]);

  const handleBack = () => {
    router.push('/available-deliveries');
  };

  const handleChat = () => {
    // TODO: Implement chat
    console.log('Chat with sender');
    alert('Chat functionality coming soon!');
  };

  const handleStatusUpdate = (newStatus: 'picked_up' | 'delivered') => {
    setStatusDialog({
      open: true,
      newStatus,
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusDialog.newStatus) return;

    setUpdating(true);

    try {
      await updateDeliveryRequestStatus(deliveryId, statusDialog.newStatus);

      // Update local state
      setDelivery(prev => prev ? { ...prev, status: statusDialog.newStatus! } : null);

      // TODO: Notification will be sent automatically by backend webhook

      const statusMessages = {
        picked_up: 'Delivery marked as picked up! The sender has been notified.',
        delivered: 'Delivery marked as delivered! Great job!',
      };

      alert(statusMessages[statusDialog.newStatus]);

      // If delivered, redirect to completed deliveries
      if (statusDialog.newStatus === 'delivered') {
        router.push('/available-deliveries');
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
      setStatusDialog({ open: false, newStatus: null });
    }
  };

  const handleCancelDialog = () => {
    setStatusDialog({ open: false, newStatus: null });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'info';
      case 'picked_up': return 'primary';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !delivery || !sender) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 375 }}>
          {error || 'Delivery not found'}
        </Alert>
      </Box>
    );
  }

  const canPickUp = delivery.status === 'accepted';
  const canDeliver = delivery.status === 'picked_up';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
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
                Active Delivery #{delivery.id}
              </Typography>
              <Chip
                label={getStatusLabel(delivery.status)}
                size="small"
                color={getStatusColor(delivery.status) as any}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 20, // Space for action buttons
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

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <LocalShipping sx={{ color: 'text.secondary', mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Package
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {delivery.size.charAt(0).toUpperCase() + delivery.size.slice(1)} parcel
                        {delivery.weight && ` • ${delivery.weight} kg`}
                      </Typography>
                    </Box>
                  </Box>

                  {delivery.notes && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: 'action.hover',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body2">{delivery.notes}</Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachMoney sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {delivery.price} zł
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Sender Info */}
              <Box sx={{ mx: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Sender Information
                </Typography>
                <SenderCard sender={sender} variant="full" showContact={true} />
              </Box>
            </Box>

            {/* Action Buttons - Sticky at bottom */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                boxShadow: 3,
                pb: 10, // Space for bottom navigation
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<Chat />}
                  onClick={handleChat}
                  fullWidth
                  sx={{ minHeight: 48, textTransform: 'none' }}
                >
                  Chat with Sender
                </Button>

                {canPickUp && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircle />}
                    onClick={() => handleStatusUpdate('picked_up')}
                    fullWidth
                    sx={{ minHeight: 48, textTransform: 'none', fontWeight: 600 }}
                  >
                    Mark as Picked Up
                  </Button>
                )}

                {canDeliver && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleStatusUpdate('delivered')}
                    fullWidth
                    sx={{ minHeight: 48, textTransform: 'none', fontWeight: 600 }}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />

        {/* Status Update Confirmation Dialog */}
        <Dialog
          open={statusDialog.open}
          onClose={handleCancelDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            {statusDialog.newStatus === 'picked_up' ? 'Confirm Pickup' : 'Confirm Delivery'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {statusDialog.newStatus === 'picked_up' ? (
                <>
                  You are about to mark this delivery as <strong>picked up</strong>.
                  The sender will be notified that you have collected the package.
                </>
              ) : (
                <>
                  You are about to mark this delivery as <strong>delivered</strong>.
                  The sender will be notified that the package has been delivered successfully.
                  This will complete the delivery.
                </>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCancelDialog} variant="outlined" disabled={updating}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusUpdate}
              variant="contained"
              color={statusDialog.newStatus === 'picked_up' ? 'primary' : 'success'}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

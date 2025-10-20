'use client';

import { use, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Chip, Stack, Divider, CircularProgress, Alert } from '@mui/material';
import { ArrowBack, LocationOn, CalendarToday, LocalShipping, Refresh } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { UserAvatar, Button } from '@/components/ui';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Order, OrderStatus, getStatusColor, getStatusLabel, canContactPicker, canContactReceiver, canCancelOrder, canReviewOrder } from '@/types/order';
import { format } from 'date-fns';
import { CancelOrderDialog } from '@/components/order/CancelOrderDialog';
import { ReviewDialog } from '@/components/order/ReviewDialog';
import ReceiverCard from '@/components/order/ReceiverCard';
import { toast } from 'react-hot-toast';
import { getDeliveryRequestById, confirmRecipient } from '@/app/api/delivery';
import { getUser, getCurrentUser } from '@/app/api/user';

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const router = useRouter();
  const { orderId } = use(params);

  const [order, setOrder] = useState<Order | undefined>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [confirmingRecipient, setConfirmingRecipient] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { user } = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch order from backend
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getDeliveryRequestById(parseInt(orderId));
        const req = response.data;

        // Map backend status to frontend OrderStatus
        let frontendStatus: OrderStatus;
        switch (req.status) {
          case 'pending':
            frontendStatus = OrderStatus.PENDING;
            break;
          case 'accepted':
          case 'picked_up':
            frontendStatus = OrderStatus.ACTIVE;
            break;
          case 'delivered':
            frontendStatus = OrderStatus.COMPLETED;
            break;
          case 'cancelled':
            frontendStatus = OrderStatus.CANCELLED;
            break;
          default:
            frontendStatus = OrderStatus.PENDING;
        }

        // Fetch picker and recipient details if they exist
        let pickerData = undefined;
        let receiverData = undefined;

        if (req.pickerId) {
          try {
            const { user: picker } = await getUser(req.pickerId);
            pickerData = {
              id: picker.uid,
              fullName: picker.name || 'Picker',
              rating: picker.rating || 0,
              avatarUrl: picker.avatarUrl,
            };
          } catch (err) {
            console.error('Failed to fetch picker:', err);
          }
        }

        if (req.recipientId) {
          try {
            const { user: recipient } = await getUser(req.recipientId);
            receiverData = {
              id: recipient.uid,
              fullName: recipient.name || 'Recipient',
              rating: recipient.rating || 0,
              avatarUrl: recipient.avatarUrl,
              isPhoneVerified: true, // TODO: get from user data
              isEmailVerified: true, // TODO: get from user data
            };
          } catch (err) {
            console.error('Failed to fetch recipient:', err);
          }
        }

        const mappedOrder: Order = {
          id: req.id.toString(),
          trackingNumber: `PCK${req.id.toString().padStart(6, '0')}`,
          status: frontendStatus,
          deliveryMethod: 'within-city' as any,
          packageType: 'SMALL_PARCEL' as any,
          pickup: {
            address: req.fromAddress,
            city: req.fromCity,
          },
          dropoff: {
            address: req.toAddress,
            city: req.toCity,
          },
          createdAt: new Date(req.createdAt),
          pickupDateTime: new Date(req.createdAt),
          price: req.price,
          currency: 'USD',
          picker: pickerData,
          receiver: receiverData,
          receiverPhone: req.recipientPhone || undefined,
          recipientConfirmed: req.recipientConfirmed,
          notes: req.notes || undefined,
          packageDescription: req.description || undefined,
        };

        setOrder(mappedOrder);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Alert severity="error">{error || 'Order not found'}</Alert>
      </Box>
    );
  }

  const handleBackClick = () => {
    router.back();
  };

  const handleContactPicker = async () => {
    if (!order.picker) return;

    try {
      // Create/get chat with picker for this delivery
      const { createChat } = await import('@/app/api/chat');
      const response = await createChat({
        participantId: order.picker.id,
        deliveryId: parseInt(order.id),
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
      toast.error('Failed to open chat');
    }
  };

  const handleContactReceiver = async () => {
    if (!order.receiver) return;

    try {
      // Create/get chat with receiver for this delivery
      const { createChat } = await import('@/app/api/chat');
      const response = await createChat({
        participantId: order.receiver.id,
        deliveryId: parseInt(order.id),
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
      toast.error('Failed to open chat');
    }
  };

  const handleCancelOrderClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelOrderConfirm = () => {
    setOrder({
      ...order,
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
    });
    setCancelDialogOpen(false);
    toast.success('Order cancelled successfully');
    setTimeout(() => router.push('/orders'), 1500);
  };

  const handleLeaveReviewClick = () => {
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    setOrder({
      ...order,
      review: {
        rating,
        comment,
        createdAt: new Date(),
      },
    });
    setReviewDialogOpen(false);
    toast.success('Review submitted successfully');
  };

  const handleRepeatOrder = () => {
    toast.success('Redirecting to create new order...');
    setTimeout(() => router.push('/delivery-methods'), 1000);
  };

  const handleConfirmRecipient = async () => {
    if (!order) return;

    setConfirmingRecipient(true);
    try {
      await confirmRecipient(parseInt(order.id), true);
      toast.success('Delivery confirmed successfully!');

      // Refresh order data
      const response = await getDeliveryRequestById(parseInt(orderId));
      const req = response.data;
      setOrder({
        ...order,
        recipientConfirmed: req.recipientConfirmed,
      });
    } catch (err: any) {
      console.error('Failed to confirm recipient:', err);
      toast.error('Failed to confirm delivery. Please try again.');
    } finally {
      setConfirmingRecipient(false);
    }
  };

  const handleRejectRecipient = async () => {
    if (!order) return;

    setConfirmingRecipient(true);
    try {
      await confirmRecipient(parseInt(order.id), false);
      toast.success('Delivery rejected. Order has been cancelled.');

      // Redirect to orders list after a short delay
      setTimeout(() => router.push('/orders'), 1500);
    } catch (err: any) {
      console.error('Failed to reject recipient:', err);
      toast.error('Failed to reject delivery. Please try again.');
      setConfirmingRecipient(false);
    }
  };

  // Check if current user is the recipient
  const isRecipient = currentUser && order?.receiver?.id === currentUser.uid;
  const showConfirmationButtons = isRecipient &&
    !order?.recipientConfirmed &&
    order?.status === OrderStatus.PENDING;

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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <IconButton onClick={handleBackClick} sx={{ mr: 1, p: 1 }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Order Details
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 10,
                px: 3,
                pt: 2,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {order.trackingNumber}
                </Typography>
                <Chip
                  label={getStatusLabel(order.status)}
                  sx={{
                    backgroundColor: getStatusColor(order.status),
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                />
              </Stack>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Route
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Pickup
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.pickup.address}
                      </Typography>
                      {order.pickup.city && (
                        <Typography variant="caption" color="text.secondary">
                          {order.pickup.city}{order.pickup.country && `, ${order.pickup.country}`}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOn sx={{ mr: 1, color: 'error.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Dropoff
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.dropoff.address}
                      </Typography>
                      {order.dropoff.city && (
                        <Typography variant="caption" color="text.secondary">
                          {order.dropoff.city}{order.dropoff.country && `, ${order.dropoff.country}`}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Timeline
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {format(order.createdAt, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalShipping sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Scheduled Pickup
                      </Typography>
                      <Typography variant="body2">
                        {format(order.pickupDateTime, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>

                  {order.deliveredAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: 'success.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Delivered
                        </Typography>
                        <Typography variant="body2">
                          {format(order.deliveredAt, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {order.cancelledAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: 'error.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Cancelled
                        </Typography>
                        <Typography variant="body2">
                          {format(order.cancelledAt, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Price
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {order.price} {order.currency}
                </Typography>
              </Box>

              {order.picker && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      Picker
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <UserAvatar
                        type="picker"
                        name={order.picker.fullName}
                        src={order.picker.avatarUrl}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {order.picker.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ⭐ {order.picker.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </>
              )}

              {(order.receiver || order.receiverPhone) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      Receiver
                    </Typography>
                    <ReceiverCard
                      receiver={{
                        recipientId: order.receiver?.id,
                        recipientPhone: order.receiverPhone,
                        recipientUser: order.receiver ? {
                          uid: order.receiver.id,
                          fullName: order.receiver.fullName,
                          avatarUrl: order.receiver.avatarUrl,
                          rating: order.receiver.rating,
                          isPhoneVerified: order.receiver.isPhoneVerified,
                          isEmailVerified: order.receiver.isEmailVerified,
                        } : undefined,
                      }}
                      onContactClick={order.receiver ? handleContactReceiver : undefined}
                      variant="compact"
                    />
                  </Box>
                </>
              )}

              {order.notes && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Notes
                    </Typography>
                    <Typography variant="body2">{order.notes}</Typography>
                  </Box>
                </>
              )}

              {order.packageDescription && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Package Description
                    </Typography>
                    <Typography variant="body2">{order.packageDescription}</Typography>
                  </Box>
                </>
              )}

              {order.review && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Your Review
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      ⭐ {order.review.rating}/5
                    </Typography>
                    {order.review.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {order.review.comment}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: 56,
                left: 0,
                right: 0,
                p: 2,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Stack spacing={1}>
                {showConfirmationButtons && (
                  <>
                    <Alert severity="info" sx={{ mb: 1 }}>
                      You have been selected as the recipient. Please confirm or reject this delivery.
                    </Alert>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleConfirmRecipient}
                      disabled={confirmingRecipient}
                    >
                      {confirmingRecipient ? 'Confirming...' : 'Confirm Delivery'}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleRejectRecipient}
                      color="error"
                      disabled={confirmingRecipient}
                    >
                      {confirmingRecipient ? 'Rejecting...' : 'Reject Delivery'}
                    </Button>
                  </>
                )}
                {isRecipient && order?.recipientConfirmed && order?.status === OrderStatus.PENDING && (
                  <Alert severity="success" sx={{ mb: 1 }}>
                    You have confirmed this delivery. Waiting for sender to proceed.
                  </Alert>
                )}
                {canContactPicker(order) && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleContactPicker}
                  >
                    Contact Picker
                  </Button>
                )}
                {canCancelOrder(order) && !showConfirmationButtons && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancelOrderClick}
                    color="error"
                  >
                    Cancel Order
                  </Button>
                )}
                {canReviewOrder(order) && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleLeaveReviewClick}
                  >
                    Leave Review
                  </Button>
                )}
                {(order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleRepeatOrder}
                    startIcon={<Refresh />}
                  >
                    Repeat Order
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />

        <CancelOrderDialog
          open={cancelDialogOpen}
          orderTrackingNumber={order.trackingNumber}
          onConfirm={handleCancelOrderConfirm}
          onCancel={() => setCancelDialogOpen(false)}
        />

        <ReviewDialog
          open={reviewDialogOpen}
          pickerName={order.picker?.fullName || 'Picker'}
          onSubmit={handleReviewSubmit}
          onCancel={() => setReviewDialogOpen(false)}
        />
      </Box>
    </Box>
  );
}

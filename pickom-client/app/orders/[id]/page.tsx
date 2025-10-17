'use client';

import { use, useState } from 'react';
import { Box, Typography, IconButton, Chip, Stack, Divider } from '@mui/material';
import { ArrowBack, LocationOn, CalendarToday, LocalShipping, Refresh } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { UserAvatar, Button } from '@/components/ui';
import BottomNavigation from '@/components/common/BottomNavigation';
import { mockOrders } from '@/data/mockOrders';
import { Order, OrderStatus, getStatusColor, getStatusLabel, canContactPicker, canContactReceiver, canCancelOrder, canReviewOrder } from '@/types/order';
import { format } from 'date-fns';
import { CancelOrderDialog } from '@/components/order/CancelOrderDialog';
import { ReviewDialog } from '@/components/order/ReviewDialog';
import ReceiverCard from '@/components/order/ReceiverCard';
import { toast } from 'react-hot-toast';

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const router = useRouter();
  const { orderId } = use(params);

  const initialOrder = mockOrders.find(o => o.id === orderId);
  const [order, setOrder] = useState<Order | undefined>(initialOrder);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Order not found</Typography>
      </Box>
    );
  }

  const handleBackClick = () => {
    router.back();
  };

  const handleContactPicker = () => {
    if (order.picker) {
      router.push(`/chat/${order.picker.id}`);
    }
  };

  const handleContactReceiver = () => {
    if (order.receiver) {
      router.push(`/chat/${order.receiver.id}`);
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
                {canContactPicker(order) && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleContactPicker}
                  >
                    Contact Picker
                  </Button>
                )}
                {canCancelOrder(order) && (
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

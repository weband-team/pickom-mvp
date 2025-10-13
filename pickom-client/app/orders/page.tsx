'use client';

import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, IconButton, CircularProgress, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { OrderCard } from '@/components/order/OrderCard';
import BottomNavigation from '@/components/common/BottomNavigation';
import { OrderStatus, Order } from '@/types/order';
import { getMyDeliveryRequests } from '../api/delivery';
import { getUser } from '../api/user';

export default function OrdersPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<OrderStatus>(OrderStatus.ACTIVE);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getMyDeliveryRequests();
        const deliveryRequests = response.data;

        // Map backend delivery requests to frontend Order format with picker data
        const mappedOrders: Order[] = await Promise.all(
          deliveryRequests.map(async (req: any) => {
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

            // Fetch picker details if pickerId exists
            let pickerData = undefined;
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
                console.error('Failed to fetch picker data for pickerId:', req.pickerId, err);
                // Fallback to basic picker data
                pickerData = {
                  id: req.pickerId,
                  fullName: 'Picker',
                  rating: 0,
                };
              }
            }

            return {
              id: req.id.toString(),
              trackingNumber: `PCK${req.id.toString().padStart(6, '0')}`,
              status: frontendStatus,
              deliveryMethod: 'within-city' as any, // TODO: get from delivery data
              packageType: 'SMALL_PARCEL' as any, // TODO: get from delivery data
              pickup: {
                address: req.fromAddress,
              },
              dropoff: {
                address: req.toAddress,
              },
              createdAt: new Date(req.createdAt),
              pickupDateTime: new Date(req.createdAt), // TODO: get actual pickup time
              price: req.price,
              currency: 'USD',
              picker: pickerData,
            };
          })
        );

        setOrders(mappedOrders);
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.status === selectedTab);
  }, [orders, selectedTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: OrderStatus) => {
    setSelectedTab(newValue);
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleContactPicker = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order?.picker) {
      router.push(`/chat/${order.picker.id}`);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const renderEmptyState = () => {
    const emptyMessages = {
      [OrderStatus.ACTIVE]: {
        emoji: '🚚',
        title: 'No active deliveries',
        description: 'You have no orders currently in delivery',
      },
      [OrderStatus.PENDING]: {
        emoji: '⏳',
        title: 'No pending orders',
        description: 'All your orders have been picked up or completed',
      },
      [OrderStatus.COMPLETED]: {
        emoji: '✅',
        title: 'No completed orders',
        description: 'Your completed deliveries will appear here',
      },
      [OrderStatus.CANCELLED]: {
        emoji: '❌',
        title: 'No cancelled orders',
        description: 'You have no cancelled orders',
      },
    };

    const message = emptyMessages[selectedTab];

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
        }}
      >
        <Typography sx={{ fontSize: '4rem', mb: 2 }}>
          {message.emoji}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
          {message.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {message.description}
        </Typography>
      </Box>
    );
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
              <IconButton
                onClick={handleBackClick}
                sx={{
                  mr: 1,
                  p: 1,
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                My Orders
              </Typography>
            </Box>

            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                },
              }}
            >
              <Tab label="Active" value={OrderStatus.ACTIVE} />
              <Tab label="Pending" value={OrderStatus.PENDING} />
              <Tab label="Completed" value={OrderStatus.COMPLETED} />
              <Tab label="Cancelled" value={OrderStatus.CANCELLED} />
            </Tabs>

            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 8,
                px: 2,
                pt: 2,
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ py: 2 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : filteredOrders.length === 0 ? (
                renderEmptyState()
              ) : (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={handleViewDetails}
                    onContactPicker={handleContactPicker}
                  />
                ))
              )}
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}

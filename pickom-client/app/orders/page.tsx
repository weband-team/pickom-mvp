'use client';

import { useState, useMemo } from 'react';
import { Box, Typography, Tabs, Tab, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { OrderCard } from '@/components/order/OrderCard';
import BottomNavigation from '@/components/common/BottomNavigation';
import { mockOrders } from '@/data/mockOrders';
import { OrderStatus } from '@/types/order';

export default function OrdersPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<OrderStatus>(OrderStatus.ACTIVE);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => order.status === selectedTab);
  }, [selectedTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: OrderStatus) => {
    setSelectedTab(newValue);
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleContactPicker = (orderId: string) => {
    const order = mockOrders.find(o => o.id === orderId);
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
              {filteredOrders.length === 0 ? (
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

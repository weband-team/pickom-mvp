'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Stack, IconButton, Alert, Card, CardContent, Avatar, Chip } from '@mui/material';
import { ArrowBack, Star, LocalShipping } from '@mui/icons-material';
import {
  MobileContainer,
  PickomLogo,
  LoadingIndicator,
  Button
} from '../../components/ui';
import { UserAvatar } from '@/components/profile/UserAvatar';
import BottomNavigation from '../../components/common/BottomNavigation';
import { theme } from '../../styles/theme';
import { useRouter } from 'next/navigation';
import { getMyDeliveryRequests, type DeliveryRequest as ApiDeliveryRequest } from '../api/delivery';

interface SenderInfo {
  uid: string;
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  rating?: number;
}

// Local interface for mapped delivery data
interface DeliveryRequest {
  id: number;
  senderId: string;
  sender?: SenderInfo;
  from: string;
  to: string;
  price: number;
  deliveryType?: 'within-city' | 'inter-city';
  packageDescription?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
  fromLocation?: {
    address: string;
    city?: string;
  };
  toLocation?: {
    address: string;
    city?: string;
  };
}

interface SenderWithOrders {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  totalOrders: number;
  activeOrders: DeliveryRequest[];
}

export default function BrowseSendersPage() {
  const router = useRouter();
  const [sendersWithOrders, setSendersWithOrders] = useState<SenderWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch delivery requests and group by sender
  useEffect(() => {
    const fetchSendersWithOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getMyDeliveryRequests();
        const deliveries: ApiDeliveryRequest[] = response.data;

        // Filter only pending deliveries that have sender information
        const pendingDeliveries = deliveries.filter(d => d.status === 'pending' && d.sender);

        // Group deliveries by sender UID
        const senderMap = new Map<string, { sender: SenderInfo; deliveries: DeliveryRequest[] }>();

        pendingDeliveries.forEach(delivery => {
          if (!delivery.sender) return; // Type guard

          const senderUid = delivery.sender.uid;
          const existing = senderMap.get(senderUid);

          // Map delivery to include proper from/to fields
          const mappedDelivery: DeliveryRequest = {
            id: delivery.id,
            senderId: delivery.senderId || '',
            sender: delivery.sender,
            from: delivery.fromLocation?.address || 'Unknown',
            to: delivery.toLocation?.address || 'Unknown',
            price: delivery.price,
            deliveryType: delivery.deliveryType,
            packageDescription: delivery.description || undefined,
            status: delivery.status,
            createdAt: delivery.createdAt,
            fromLocation: delivery.fromLocation ? {
              address: delivery.fromLocation.address,
              city: delivery.fromLocation.city,
            } : undefined,
            toLocation: delivery.toLocation ? {
              address: delivery.toLocation.address,
              city: delivery.toLocation.city,
            } : undefined,
          };

          if (existing) {
            existing.deliveries.push(mappedDelivery);
          } else {
            senderMap.set(senderUid, {
              sender: delivery.sender,
              deliveries: [mappedDelivery],
            });
          }
        });

        // Create SenderWithOrders array
        const sendersData: SenderWithOrders[] = Array.from(senderMap.values()).map(({ sender, deliveries }) => ({
          id: sender.uid,
          fullName: sender.name,
          email: sender.email,
          avatarUrl: sender.avatarUrl,
          rating: typeof sender.rating === 'number' ? sender.rating : parseFloat(sender.rating || '0'),
          totalOrders: deliveries.length, // Count current active orders
          activeOrders: deliveries,
        }));

        // Sort by number of active orders (most active first)
        sendersData.sort((a, b) => b.activeOrders.length - a.activeOrders.length);

        setSendersWithOrders(sendersData);
      } catch (err: unknown) {
        console.error('Failed to fetch senders:', err);
        setError('Failed to load senders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSendersWithOrders();
  }, []);

  const handleViewOrder = (orderId: number) => {
    router.push(`/delivery-details/${orderId}`);
  };

  const handleChat = (senderId: string) => {
    router.push(`/chats/${senderId}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
        <MobileContainer showFrame={false}>
          {/* User Avatar */}
          <UserAvatar
            name="Vadim"
            sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
          />

          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.white,
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => router.back()}
                size="small"
                sx={{ p: 1 }}
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Browse Senders
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sendersWithOrders.length} senders looking for pickers
                </Typography>
              </Box>
              <PickomLogo variant="icon" size="small" />
            </Stack>
          </Box>

          {/* Error Alert */}
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {/* Results */}
          <Box sx={{ flex: 1, overflow: 'auto', pb: 8 }}>
            {loading ? (
              <Box sx={{ py: 8 }}>
                <LoadingIndicator
                  type="dots"
                  text="Loading senders..."
                />
              </Box>
            ) : sendersWithOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                  📦
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  No senders found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No senders are currently looking for pickers
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {sendersWithOrders.map((sender) => (
                    <Card
                      key={sender.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: 1,
                        '&:hover': {
                          boxShadow: 3,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {/* Sender Info */}
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <Avatar
                            sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                          >
                            {sender.fullName.charAt(0)}
                          </Avatar>

                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {sender.fullName}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                              <Typography variant="body2" color="text.secondary">
                                {sender.rating.toFixed(1)} ({sender.totalOrders} orders)
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>

                        {/* Active Orders */}
                        <Box
                          sx={{
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                            p: 1.5,
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <LocalShipping sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Active Requests ({sender.activeOrders.length})
                            </Typography>
                          </Box>

                          <Stack spacing={1}>
                            {sender.activeOrders.slice(0, 2).map((order) => (
                              <Box
                                key={order.id}
                                sx={{
                                  p: 1,
                                  backgroundColor: 'background.paper',
                                  borderRadius: 1,
                                  border: 1,
                                  borderColor: 'divider',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'action.hover',
                                  },
                                }}
                                onClick={() => handleViewOrder(order.id)}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  #{order.id}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                  {order.from} → {order.to}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {order.price} zł
                                  </Typography>
                                  {order.deliveryType && (
                                    <Chip
                                      label={order.deliveryType === 'within-city' ? 'City' : 'Inter-City'}
                                      size="small"
                                      color={order.deliveryType === 'within-city' ? 'primary' : 'warning'}
                                      sx={{ height: 18, fontSize: '0.65rem' }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            ))}

                            {sender.activeOrders.length > 2 && (
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 0.5 }}>
                                +{sender.activeOrders.length - 2} more orders
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        {/* Actions */}
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleChat(sender.id)}
                            sx={{ flex: 1, textTransform: 'none' }}
                          >
                            Chat
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewOrder(sender.activeOrders[0].id)}
                            sx={{ flex: 1, textTransform: 'none' }}
                          >
                            View Orders
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}

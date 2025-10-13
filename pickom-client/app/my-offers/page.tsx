'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { LocalOffer, LocationOn, AttachMoney, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getMyOffers } from '@/app/api/offers';
import { getDeliveryRequestById } from '@/app/api/delivery';

type OfferStatus = 'all' | 'pending' | 'accepted' | 'rejected';

interface OfferWithDelivery {
  id: number;
  deliveryId: number;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  delivery?: {
    id: number;
    fromAddress: string;
    fromCity?: string;
    toAddress: string;
    toCity?: string;
    deliveryType?: 'within-city' | 'inter-city';
    price: number;
    status: string;
  };
}

export default function MyOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferWithDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<OfferStatus>('all');

  // Fetch my offers
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getMyOffers();
        const offersData = response.data;

        // Fetch delivery data for each offer
        const offersWithDelivery = await Promise.all(
          offersData.map(async (offer: any) => {
            try {
              const deliveryResponse = await getDeliveryRequestById(offer.deliveryId);
              return {
                ...offer,
                delivery: {
                  id: deliveryResponse.data.id,
                  fromAddress: deliveryResponse.data.fromAddress,
                  fromCity: deliveryResponse.data.fromCity,
                  toAddress: deliveryResponse.data.toAddress,
                  toCity: deliveryResponse.data.toCity,
                  deliveryType: deliveryResponse.data.deliveryType,
                  price: deliveryResponse.data.price,
                  status: deliveryResponse.data.status,
                },
              };
            } catch (err) {
              console.error(`Failed to fetch delivery ${offer.deliveryId}:`, err);
              return offer;
            }
          })
        );

        setOffers(offersWithDelivery);
      } catch (err: any) {
        console.error('Failed to fetch my offers:', err);
        setError('Failed to load your offers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Filter offers by status
  const filteredOffers = useMemo(() => {
    if (selectedTab === 'all') return offers;
    return offers.filter(offer => offer.status === selectedTab);
  }, [offers, selectedTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: OfferStatus) => {
    setSelectedTab(newValue);
  };

  const handleOfferClick = (offer: OfferWithDelivery) => {
    // If accepted, go to active delivery page
    if (offer.status === 'accepted') {
      router.push(`/delivery-details/${offer.deliveryId}`);
    } else {
      // Otherwise go to delivery details to view
      router.push(`/delivery-details/${offer.deliveryId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Empty state messages
  const getEmptyMessage = () => {
    const messages = {
      all: {
        icon: '📭',
        title: 'No offers yet',
        description: 'Browse available deliveries and make your first offer!',
      },
      pending: {
        icon: '⏳',
        title: 'No pending offers',
        description: 'All your offers have been reviewed.',
      },
      accepted: {
        icon: '✅',
        title: 'No accepted offers',
        description: 'Accepted offers will appear here. Start delivering!',
      },
      rejected: {
        icon: '❌',
        title: 'No rejected offers',
        description: 'Keep making offers on new deliveries!',
      },
    };

    return messages[selectedTab];
  };

  const renderEmptyState = () => {
    const message = getEmptyMessage();

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
          {message.icon}
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

  // Count offers by status
  const offerCounts = useMemo(() => {
    return {
      all: offers.length,
      pending: offers.filter(o => o.status === 'pending').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      rejected: offers.filter(o => o.status === 'rejected').length,
    };
  }, [offers]);

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
              <LocalOffer sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
                My Offers
              </Typography>
            </Box>

            {/* Tabs */}
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
              <Tab label={`All (${offerCounts.all})`} value="all" />
              <Tab label={`Pending (${offerCounts.pending})`} value="pending" />
              <Tab label={`Accepted (${offerCounts.accepted})`} value="accepted" />
              <Tab label={`Rejected (${offerCounts.rejected})`} value="rejected" />
            </Tabs>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 8,
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : filteredOffers.length === 0 ? (
                renderEmptyState()
              ) : (
                <Box sx={{ p: 2 }}>
                  {filteredOffers.map((offer) => {
                    const priceDiff = offer.delivery ? offer.price - offer.delivery.price : 0;
                    const priceDiffPercent = offer.delivery
                      ? ((priceDiff / offer.delivery.price) * 100).toFixed(0)
                      : '0';

                    return (
                      <Card
                        key={offer.id}
                        sx={{
                          mb: 2,
                          border: 2,
                          borderColor:
                            offer.status === 'accepted'
                              ? 'success.main'
                              : offer.status === 'rejected'
                              ? 'error.light'
                              : 'divider',
                          opacity: offer.status === 'rejected' ? 0.7 : 1,
                        }}
                      >
                        <CardActionArea onClick={() => handleOfferClick(offer)}>
                          <CardContent>
                            {/* Status and date */}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                                flexWrap: 'wrap',
                                gap: 1,
                              }}
                            >
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                  label={getStatusLabel(offer.status)}
                                  size="small"
                                  color={getStatusColor(offer.status) as any}
                                  sx={{ fontWeight: 600 }}
                                />
                                {offer.delivery?.deliveryType === 'inter-city' && (
                                  <Chip
                                    label="Inter-City"
                                    size="small"
                                    color="info"
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(offer.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>

                            {/* Delivery info */}
                            {offer.delivery && (
                              <>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                  Delivery #{offer.deliveryId}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                    {offer.delivery.fromAddress} → {offer.delivery.toAddress}
                                  </Typography>
                                </Box>

                                {/* Price comparison */}
                                <Box
                                  sx={{
                                    mt: 2,
                                    pt: 2,
                                    borderTop: 1,
                                    borderColor: 'divider',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      My offer
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <AttachMoney sx={{ fontSize: 18, color: 'primary.main' }} />
                                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                        {offer.price} zł
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Listed price
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {offer.delivery.price} zł
                                    </Typography>
                                  </Box>

                                  {priceDiff !== 0 && (
                                    <Chip
                                      icon={
                                        priceDiff < 0 ? (
                                          <TrendingDown sx={{ fontSize: 14 }} />
                                        ) : (
                                          <TrendingUp sx={{ fontSize: 14 }} />
                                        )
                                      }
                                      label={`${priceDiff > 0 ? '+' : ''}${priceDiffPercent}%`}
                                      size="small"
                                      color={priceDiff < 0 ? 'success' : 'warning'}
                                      sx={{ height: 24, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                              </>
                            )}

                            {/* Message preview */}
                            {offer.message && (
                              <Box
                                sx={{
                                  mt: 2,
                                  p: 1,
                                  borderRadius: 1,
                                  backgroundColor: 'action.hover',
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  💬 {offer.message}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}

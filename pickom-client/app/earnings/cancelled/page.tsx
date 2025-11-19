'use client';

import { Box, Typography, Button, CircularProgress, Alert, Card, CardContent, Chip } from '@mui/material';
import { ArrowBack, Cancel } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getCancelledDeliveries, DeliveryRequest } from '../../api/delivery';

export default function CancelledDeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await getCancelledDeliveries();
        setDeliveries(response.data || []);
      } catch {
        setError('Failed to load cancelled deliveries.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <MobileContainer showFrame={false}>
        <Box sx={{ p: 3, pb: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Button
                onClick={handleBackClick}
                sx={{ minWidth: 'auto', p: 1, mr: 1 }}
              >
                <ArrowBack />
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Cancelled Deliveries
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {deliveries.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Cancel sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No cancelled deliveries
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Your cancelled deliveries will appear here
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {deliveries.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {delivery.title}
                        </Typography>
                        <Chip
                          label="Cancelled"
                          color="error"
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          From: {delivery.fromLocation?.address}
                          {delivery.fromLocation?.city && `, ${delivery.fromLocation.city}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          To: {delivery.toLocation?.address}
                          {delivery.toLocation?.city && `, ${delivery.toLocation.city}`}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(delivery.createdAt)}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          ${delivery.price.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
        </Box>
      </MobileContainer>
      <BottomNavigation />
    </>
  );
}

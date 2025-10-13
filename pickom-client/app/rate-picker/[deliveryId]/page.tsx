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
  TextField,
  Card,
  CardContent,
  Rating,
  Avatar,
} from '@mui/material';
import { ArrowBack, Star, StarBorder } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getDeliveryRequestById } from '@/app/api/delivery';
import { getUser } from '@/app/api/user';
import { createRating } from '@/app/api/rating';

export default function RatePickerPage({ params }: { params: Promise<{ deliveryId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [picker, setPicker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchPickerInfo = async () => {
      setLoading(true);
      setError('');

      try {
        const deliveryResponse = await getDeliveryRequestById(Number(resolvedParams.deliveryId));
        const delivery = deliveryResponse.data;

        if (!delivery.pickerId) {
          setError('No picker assigned to this delivery');
          return;
        }

        const pickerResponse = await getUser(delivery.pickerId);
        setPicker(pickerResponse.user);
      } catch (err: any) {
        console.error('Failed to fetch picker:', err);
        setError('Failed to load picker information');
      } finally {
        setLoading(false);
      }
    };

    fetchPickerInfo();
  }, [resolvedParams.deliveryId]);

  const handleSubmit = async () => {
    if (!picker || ratingValue === 0) return;

    setSubmitting(true);

    try {
      await createRating({
        deliveryId: Number(resolvedParams.deliveryId),
        toUserId: picker.uid,
        rating: ratingValue,
        comment: comment || undefined,
      });

      alert('Rating submitted successfully!');
      router.push('/orders');
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    } finally {
      setSubmitting(false);
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
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 375 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
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
                gap: 1,
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <IconButton onClick={() => router.push('/orders')} size="small">
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Rate Picker
              </Typography>
            </Box>

            <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={picker?.avatarUrl}
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: 32,
                    }}
                  >
                    {picker?.name?.[0]}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {picker?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    How was your delivery experience?
                  </Typography>
                </CardContent>
              </Card>

              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Rating
                </Typography>
                <Rating
                  value={ratingValue}
                  onChange={(_, newValue) => setRatingValue(newValue || 0)}
                  size="large"
                  icon={<Star fontSize="inherit" />}
                  emptyIcon={<StarBorder fontSize="inherit" />}
                  sx={{
                    fontSize: 48,
                    '& .MuiRating-iconFilled': {
                      color: 'primary.main',
                    },
                  }}
                />
              </Box>

              <TextField
                label="Comment (optional)"
                multiline
                rows={4}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={submitting || ratingValue === 0}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}

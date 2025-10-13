'use client';

import { Box, Typography, Button, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { handleMe } from '../../../api/auth';
import { getUserBalance } from '../../../api/user';

export default function TopUpSuccessPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await handleMe();
        const userData = userResponse.data.user;

        const balanceResponse = await getUserBalance(userData.uid);
        setBalance(balanceResponse.balance || 0);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load balance. Please check your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleBackToEarnings = () => {
    router.push('/earnings');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
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
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
        <MobileContainer showFrame={false}>
          <Box
            sx={{
              p: 3,
              pb: 10,
              backgroundColor: 'background.default',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your balance has been updated
              </Typography>
            </Box>

            {error ? (
              <Alert severity="warning" sx={{ mb: 3, width: '100%' }}>
                {error}
              </Alert>
            ) : (
              <Card sx={{ mb: 4, width: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    New Balance
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea' }}>
                    ${balance.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleBackToEarnings}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Back to Earnings
            </Button>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}

'use client';

import { Box, Typography, Button, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { ArrowBack, AccountBalanceWallet, TrendingUp, Cancel } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { handleMe } from '../api/auth';
import { getUserBalance } from '../api/user';
import { getCompletedDeliveries, getCancelledDeliveries } from '../api/delivery';
import { User } from '../api/dto/user';

export default function EarningsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [cancelledCount, setCancelledCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await handleMe();
        const userData = userResponse.data.user;
        setUser(userData);

        // Check if user is a picker
        if (userData.role !== 'picker') {
          setError('This page is only available for pickers.');
          setTimeout(() => router.push('/profile'), 2000);
          return;
        }

        const balanceResponse = await getUserBalance(userData.uid);
        setBalance(Number(balanceResponse.balance) || 0);

        const [completedRes, cancelledRes] = await Promise.all([
          getCompletedDeliveries(),
          getCancelledDeliveries(),
        ]);

        const completed = completedRes.data || [];
        const cancelled = cancelledRes.data || [];

        setCompletedCount(completed.length);
        setCancelledCount(cancelled.length);

        const earnings = completed.reduce((sum, delivery) => sum + (Number(delivery.price) || 0), 0);
        setTotalEarnings(Number(earnings) || 0);
      } catch (err) {
        console.error('Failed to fetch earnings data:', err);
        setError('Failed to load earnings. Please login again.');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleBackClick = () => {
    router.back();
  };

  const handleTopUpClick = () => {
    router.push('/earnings/top-up');
  };

  const handleViewCompleted = () => {
    router.push('/earnings/completed');
  };

  const handleViewCancelled = () => {
    router.push('/earnings/cancelled');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
        <Alert severity="error">{error || 'Failed to load earnings'}</Alert>
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
          <Box sx={{ p: 3, pb: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Button
                onClick={handleBackClick}
                sx={{ minWidth: 'auto', p: 1, mr: 1 }}
              >
                <ArrowBack />
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                My Earnings
              </Typography>
            </Box>

            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWallet sx={{ color: 'white', mr: 1 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Current Balance
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                  ${balance.toFixed(2)}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleTopUpClick}
                  sx={{
                    backgroundColor: 'white',
                    color: '#667eea',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  Top Up Balance
                </Button>
              </CardContent>
            </Card>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Statistics
            </Typography>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ color: '#4caf50', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Completed Deliveries
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {completedCount}
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="text" onClick={handleViewCompleted}>
                    View
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWallet sx={{ color: '#2196f3', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Earnings
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2196f3' }}>
                  ${totalEarnings.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Cancel sx={{ color: '#f44336', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cancelled Deliveries
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {cancelledCount}
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="text" onClick={handleViewCancelled}>
                    View
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}

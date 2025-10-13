'use client';

import { Box, Typography, IconButton, Button, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { ArrowBack, Logout, AccountBalanceWallet, TrendingUp } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import { handleLogout } from '../api/auth';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { EditableDescription } from '@/components/profile/EditableDescription';
import { UserType } from '@/types/auth';
import BottomNavigation from '../../components/common/BottomNavigation';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { handleMe } from '../api/auth';
import { getUserBalance } from '../api/user';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await handleMe();
        const userData = response.data.user;
        setUser(userData);

        // Fetch balance only for pickers
        if (userData.role === 'picker') {
          try {
            const balanceResponse = await getUserBalance(userData.uid);
            setBalance(Number(balanceResponse.balance) || 0);
          } catch (balanceErr) {
            console.error('Failed to fetch balance:', balanceErr);
            // Don't fail the whole page if balance fetch fails
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile. Please login again.');
        // Redirect to login if not authenticated
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleBackClick = () => {
    router.back();
  };

  const handleDescriptionSave = (newDescription: string) => {
    console.log('New description:', newDescription);
  };

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await handleLogout(); // Clear session on backend
      await signOut(auth);  // Sign out from Firebase
      // Clear all user-related data from localStorage
      localStorage.removeItem('userRole');
      localStorage.removeItem('pickerOnlineStatus');
      localStorage.removeItem('pickerPlannedTrips');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to sign out. Please try again.');
      setLoggingOut(false);
    }
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
        <Alert severity="error">{error || 'Failed to load profile'}</Alert>
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
          <Box sx={{ p: 3, pb: 6, backgroundColor: 'background.default', minHeight: '100vh' }}>
            {/* Header with Back Button and Theme Toggle */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconButton
                onClick={handleBackClick}
                sx={{
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              <ThemeToggle />
            </Box>

            {/* Profile Header */}
            <ProfileHeader user={{
              id: user.uid,
              fullName: user.name,
              email: user.email,
              age: user.age || 0,
              country: user.country || '',
              city: user.city || '',
              userType: user.role === 'picker' ? UserType.PICKER : UserType.SENDER,
              avatarUrl: user.avatarUrl,
              description: user.bio || 'No description yet.',
              rating: user.rating || 0,
              isVerified: user.isVerified || false,
            }} />

            {/* Editable Description */}
            <EditableDescription
              description={user.bio || 'No description yet.'}
              onSave={handleDescriptionSave}
            />

            {/* Rating */}
            <ProfileStats
              rating={user.rating || 0}
              totalRatings={user.totalRatings || 0}
              role={user.role}
              completedDeliveries={user.completedDeliveries || 0}
              totalOrders={user.totalOrders || 0}
            />

            {/* My Earnings Card - Only for Pickers */}
            {user.role === 'picker' && (
              <Card
                sx={{
                  mb: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => router.push('/earnings')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <AccountBalanceWallet sx={{ color: 'white', mr: 1, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                          My Earnings
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                        ${balance.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Current Balance
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 48 }} />
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: 'white',
                      color: '#667eea',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/earnings');
                    }}
                  >
                    View Earnings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* User Info */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Location:</Typography>
                  <Typography variant="body2">{user.city || 'N/A'}, {user.country || 'N/A'}</Typography>
                </Box>

                {user.age && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Age:</Typography>
                    <Typography variant="body2">{user.age}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body2">{user.email}</Typography>
                </Box>

                {user.phone && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Phone:</Typography>
                    <Typography variant="body2">{user.phone}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Role:</Typography>
                  <Typography variant="body2">{user.role === 'picker' ? 'Picker' : 'Sender'}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Sign Out Button */}
            <Box sx={{ mt: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleSignOut}
                disabled={loggingOut}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}
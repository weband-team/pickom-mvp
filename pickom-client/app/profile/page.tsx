'use client';

import { Box, Typography, IconButton, Button, CircularProgress, Alert } from '@mui/material';
import { ArrowBack, Logout, AccountBalanceWallet, Edit } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import { handleLogout } from '../api/auth';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { UserType } from '@/types/auth';
import BottomNavigation from '../../components/common/BottomNavigation';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { handleMe } from '../api/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await handleMe();
        setUser(response.data.user);
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

            {/* About Section */}
            {user.about && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  About
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {user.about}
                </Typography>
              </Box>
            )}

            {/* Rating */}
            <ProfileStats
              rating={user.rating || 0}
              totalRatings={user.totalRatings || 0}
              role={user.role}
              completedDeliveries={user.completedDeliveries || 0}
              totalOrders={user.totalOrders || 0}
            />

            {/* User Info */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {user.location && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Location:</Typography>
                    <Typography variant="body2">
                      {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
                    </Typography>
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

            {/* Edit Profile Button */}
            <Box sx={{ mt: 4 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Edit />}
                onClick={() => router.push('/profile/edit')}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                Edit Profile
              </Button>
            </Box>

            {/* Earnings/Balance Button */}
            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AccountBalanceWallet />}
                onClick={() => router.push('/earnings')}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {user.role === 'picker' ? 'My Earnings' : 'My Balance'}
              </Button>
            </Box>

            {/* Sign Out Button */}
            <Box sx={{ mt: 2 }}>
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
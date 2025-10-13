'use client';

import { use, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { ArrowBack, Chat as ChatIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { UserType } from '@/types/auth';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getUser, getCurrentUser } from '@/app/api/user';
import { createChat } from '@/app/api/chat';
import { User } from '@/app/api/dto/user';

export default function UserProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { uid } = resolvedParams;

  const [user, setUser] = useState<User | null>(null);
  const [currentUserUid, setCurrentUserUid] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const currentUserResponse = await getCurrentUser();
        setCurrentUserUid(currentUserResponse.user.uid);

        // Get profile user
        const userResponse = await getUser(uid);
        setUser(userResponse.user);
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  const handleBackClick = () => {
    router.back();
  };

  const handleChat = async () => {
    if (!user) return;

    setCreatingChat(true);
    try {
      const response = await createChat({
        participantId: user.uid,
        // No deliveryId - general chat
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch (err: any) {
      console.error('Failed to open chat:', err);
      alert('Failed to open chat. Please try again.');
    } finally {
      setCreatingChat(false);
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

  // Check if viewing own profile
  const isOwnProfile = currentUserUid === user.uid;

  // If viewing own profile, redirect to /profile
  if (isOwnProfile) {
    router.push('/profile');
    return null;
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
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, minHeight: 812 }}>
        <MobileContainer showFrame={false}>
          <Box sx={{ p: 3, pb: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
            {/* Header with Back Button */}
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
            </Box>

            {/* Profile Header */}
            <ProfileHeader user={{
              id: user.uid,
              fullName: user.name,
              email: user.email,
              age: 0,
              country: '',
              city: '',
              userType: user.role === 'picker' ? UserType.PICKER : UserType.SENDER,
              avatarUrl: user.avatarUrl,
              description: '',
              rating: user.rating || 0,
              isVerified: false,
            }} />

            {/* Rating */}
            <ProfileStats
              rating={user.rating || 0}
              totalRatings={user.totalRatings || 0}
              role={user.role}
              completedDeliveries={user.completedDeliveries || 0}
              totalOrders={user.totalOrders || 0}
            />

            {/* User Info Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Role:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.role === 'picker' ? 'Picker' : 'Sender'}
                    </Typography>
                  </Box>

                  {user.phone && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Phone:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.phone}</Typography>
                    </Box>
                  )}

                  {user.isOnline !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: user.isOnline ? '#4caf50' : '#9e9e9e'
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.isOnline ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {user.createdAt && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Member since:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Picker-specific Info */}
            {user.role === 'picker' && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Picker Details
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {user.basePrice && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Base Price:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                          {Number(user.basePrice).toFixed(2)} zł
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Chat Button */}
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={handleChat}
                disabled={creatingChat}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {creatingChat ? 'Opening chat...' : 'Send Message'}
              </Button>
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}

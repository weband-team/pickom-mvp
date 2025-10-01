'use client';

import { Box, Typography, IconButton, Button } from '@mui/material';
import { ArrowBack, LocalShipping } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { EditableDescription } from '@/components/profile/EditableDescription';
import { UserType } from '@/types/auth';
import BottomNavigation from '../../components/common/BottomNavigation';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { mockOrders } from '@/data/mockOrders';
import { OrderStatus } from '@/types/order';

// Mock user data for now
const mockUser = {
  id: '1',
  fullName: 'Vadim Petrov',
  email: 'vadim@example.com',
  age: 28,
  country: 'Russia',
  city: 'Moscow',
  userType: UserType.PICKER,
  avatarUrl: undefined,
  description: 'Experienced traveler and reliable package handler. Available for picking up packages across Moscow and nearby cities.',
  rating: 4.6,
  isVerified: true,
};

const senderRating = 4.8;
const pickerRating = 4.6;

export default function ProfilePage() {
  const router = useRouter();

  const activeOrdersCount = mockOrders.filter(
    order => order.status === OrderStatus.ACTIVE
  ).length;

  const handleBackClick = () => {
    router.back();
  };

  const handleDescriptionSave = (newDescription: string) => {
    console.log('New description:', newDescription);
  };

  const handleMyOrdersClick = () => {
    router.push('/orders');
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
            <ProfileHeader user={mockUser} />

            {/* Editable Description */}
            <EditableDescription
              description={mockUser.description}
              onSave={handleDescriptionSave}
            />

            {/* Ratings */}
            <ProfileStats
              senderRating={senderRating}
              pickerRating={pickerRating}
            />

            {/* My Orders Section */}
            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocalShipping />}
                onClick={handleMyOrdersClick}
                sx={{
                  py: 1.5,
                  justifyContent: 'space-between',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
                endIcon={
                  activeOrdersCount > 0 && (
                    <Box
                      sx={{
                        backgroundColor: 'primary.main',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {activeOrdersCount}
                    </Box>
                  )
                }
              >
                My Orders
              </Button>
            </Box>

            {/* User Info */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Location:</Typography>
                  <Typography variant="body2">{mockUser.city}, {mockUser.country}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Age:</Typography>
                  <Typography variant="body2">{mockUser.age}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body2">{mockUser.email}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation activeOrdersCount={activeOrdersCount} />
      </Box>
    </Box>
  );
}
'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { EditableDescription } from '@/components/profile/EditableDescription';
import { UserType } from '@/types/auth';

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

  const handleBackClick = () => {
    router.back();
  };

  const handleDescriptionSave = (newDescription: string) => {
    console.log('New description:', newDescription);
    // TODO: Save to backend
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        p: 2,
      }}
    >
      <MobileContainer showFrame={false}>
        <Box sx={{ p: 3, pb: 6 }}>
          {/* Back Button */}
          <Box sx={{ mb: 2 }}>
            <IconButton
              onClick={handleBackClick}
              sx={{
                p: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
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
    </Box>
  );
}
'use client';

import { Box, Typography, Stack } from '@mui/material';
import {
  Button,
  MobileContainer,
  PickomLogo
} from '../../components/ui';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { UserType } from '../../types/auth';
import { useRouter } from 'next/navigation';

export default function UserTypePage() {
  const router = useRouter();

  const handleUserTypeSelect = (userType: UserType) => {
    // Store user type in sessionStorage for the registration process
    sessionStorage.setItem('selectedUserType', userType);
    router.push('/register');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <MobileContainer showFrame={false}>
        {/* User Avatar */}
        <UserAvatar
          name="Vadim"
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        />

        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PickomLogo variant="full" size="large" />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Welcome to Pickom
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose how you&apos;d like to use our platform
            </Typography>
          </Box>

          {/* User Type Selection */}
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              I want to:
            </Typography>

            <Stack spacing={2}>
              <Button
                onClick={() => handleUserTypeSelect(UserType.SENDER)}
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: '#e0e0e0',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#000000',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  📦 Send Packages
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  I need someone to deliver my packages
                </Typography>
              </Button>

              <Button
                onClick={() => handleUserTypeSelect(UserType.PICKER)}
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: '#e0e0e0',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#000000',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  🚀 Pick & Deliver
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  I want to earn money by delivering packages
                </Typography>
              </Button>
            </Stack>

            {/* Sign In Link */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Already have an account?
              </Typography>
              <Button
                variant="text"
                onClick={() => router.push('/')}
                fullWidth
              >
                Sign In
              </Button>
            </Box>
          </Stack>
        </Box>
      </MobileContainer>
    </Box>
  );
}
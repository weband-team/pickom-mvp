'use client';

import { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import {
  Button,
  MobileContainer,
  PickomLogo
} from '../../components/ui';
import { UserType } from '../../types/auth';
import { useRouter } from 'next/navigation';

export default function UserTypePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedRole(userType);
    // Store user type in sessionStorage for the registration process
    sessionStorage.setItem('selectedUserType', userType);
  };

  const handleNext = () => {
    if (selectedRole) {
      router.push('/register');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <MobileContainer showFrame={false}>
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
                variant={selectedRole === UserType.SENDER ? 'contained' : 'outlined'}
                size="large"
                fullWidth
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: selectedRole === UserType.SENDER ? 'primary.main' : 'divider',
                  backgroundColor: selectedRole === UserType.SENDER ? 'primary.main' : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedRole === UserType.SENDER ? 'primary.dark' : 'action.hover',
                    borderColor: selectedRole === UserType.SENDER ? 'primary.dark' : 'text.primary',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  📦 Send Packages
                </Typography>
                <Typography variant="body2" color={selectedRole === UserType.SENDER ? 'inherit' : 'text.secondary'} sx={{ textAlign: 'center' }}>
                  I need someone to deliver my packages
                </Typography>
              </Button>

              <Button
                onClick={() => handleUserTypeSelect(UserType.PICKER)}
                variant={selectedRole === UserType.PICKER ? 'contained' : 'outlined'}
                size="large"
                fullWidth
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: selectedRole === UserType.PICKER ? 'primary.main' : 'divider',
                  backgroundColor: selectedRole === UserType.PICKER ? 'primary.main' : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedRole === UserType.PICKER ? 'primary.dark' : 'action.hover',
                    borderColor: selectedRole === UserType.PICKER ? 'primary.dark' : 'text.primary',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  🚀 Pick & Deliver
                </Typography>
                <Typography variant="body2" color={selectedRole === UserType.PICKER ? 'inherit' : 'text.secondary'} sx={{ textAlign: 'center' }}>
                  I want to earn money by delivering packages
                </Typography>
              </Button>
            </Stack>

            {/* Next Button */}
            {selectedRole && (
              <Box sx={{ mt: 3 }}>
                <Button
                  onClick={handleNext}
                  variant="contained"
                  fullWidth
                  size="large"
                >
                  Next
                </Button>
              </Box>
            )}

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
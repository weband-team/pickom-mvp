'use client';

import { Box, Typography, Avatar, Stack } from '@mui/material';
import { Phone, VerifiedUser } from '@mui/icons-material';
import { Button } from '../ui';

export interface ReceiverData {
  recipientId?: string;
  recipientPhone?: string;
  recipientUser?: {
    uid: string;
    fullName: string;
    avatarUrl?: string;
    rating: number;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
  };
}

interface ReceiverCardProps {
  receiver: ReceiverData;
  onContactClick?: () => void;
  variant?: 'compact' | 'full';
}

export default function ReceiverCard({
  receiver,
  onContactClick,
  variant = 'compact'
}: ReceiverCardProps) {
  if (receiver.recipientId && receiver.recipientUser) {
    const isVerified = receiver.recipientUser.isPhoneVerified && receiver.recipientUser.isEmailVerified;

    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={receiver.recipientUser.avatarUrl}
            sx={{
              width: variant === 'full' ? 64 : 48,
              height: variant === 'full' ? 64 : 48,
              bgcolor: 'success.main',
              fontSize: variant === 'full' ? '1.5rem' : '1.2rem'
            }}
          >
            {receiver.recipientUser.fullName.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography variant={variant === 'full' ? 'h6' : 'subtitle2'} sx={{ fontWeight: 600 }}>
                {receiver.recipientUser.fullName}
              </Typography>
              {isVerified && (
                <VerifiedUser sx={{ fontSize: 18, color: 'success.main' }} />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              ⭐ {typeof receiver.recipientUser.rating === 'number' ? receiver.recipientUser.rating.toFixed(1) : '0.0'}
            </Typography>
          </Box>
        </Stack>

        {onContactClick && (
          <Button
            variant="contained"
            fullWidth
            onClick={onContactClick}
            sx={{ mt: 2 }}
          >
            Contact Receiver
          </Button>
        )}
      </Box>
    );
  }

  if (receiver.recipientPhone) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Phone sx={{ color: 'text.secondary', fontSize: 24 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Receiver Phone
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {receiver.recipientPhone}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          fullWidth
          onClick={() => window.open(`tel:${receiver.recipientPhone}`)}
          sx={{ mt: 2 }}
          startIcon={<Phone />}
        >
          Call
        </Button>
      </Box>
    );
  }

  return null;
}

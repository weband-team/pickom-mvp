'use client';

import { Box, Typography, Avatar, Chip, Stack, LinearProgress } from '@mui/material';
import { VerifiedUser, DirectionsCar, CheckCircle } from '@mui/icons-material';

export interface PickerCardData {
  uid: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  completedDeliveries: number;
  vehicle?: string;
  isVerified: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  trustLevel?: number; // 0-100
}

interface PickerCardProps {
  picker: PickerCardData;
  variant?: 'compact' | 'full';
  showActions?: boolean;
}

export default function PickerCardComponent({
  picker,
  variant = 'compact',
}: PickerCardProps) {
  const trustLevel = picker.trustLevel || 0;

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
          src={picker.avatarUrl}
          sx={{
            width: variant === 'full' ? 64 : 48,
            height: variant === 'full' ? 64 : 48,
            bgcolor: 'secondary.main',
            fontSize: variant === 'full' ? '1.5rem' : '1.2rem'
          }}
        >
          {picker.fullName.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          {/* Name and verification */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography variant={variant === 'full' ? 'h6' : 'subtitle2'} sx={{ fontWeight: 600 }}>
              {picker.fullName}
            </Typography>
            {picker.isVerified && (
              <VerifiedUser sx={{ fontSize: 18, color: 'primary.main' }} />
            )}
          </Box>

          {/* Rating and reviews */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ⭐ {picker.rating.toFixed(1)} ({picker.reviewCount} {picker.reviewCount === 1 ? 'review' : 'reviews'})
          </Typography>

          {/* Stats */}
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {/* Vehicle */}
            {picker.vehicle && (
              <Chip
                icon={<DirectionsCar sx={{ fontSize: 14 }} />}
                label={picker.vehicle}
                size="small"
                color="info"
                variant="outlined"
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}

            {/* Completed deliveries */}
            <Chip
              icon={<CheckCircle sx={{ fontSize: 14 }} />}
              label={`${picker.completedDeliveries} ${picker.completedDeliveries === 1 ? 'delivery' : 'deliveries'}`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
          </Stack>

          {/* Trust Level */}
          {variant === 'full' && trustLevel > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Trust Level
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: trustLevel >= 80 ? 'success.main' : 'warning.main' }}>
                  {trustLevel}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={trustLevel}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: trustLevel >= 80 ? 'success.main' : trustLevel >= 50 ? 'warning.main' : 'error.main',
                    borderRadius: 3,
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

'use client';

import { memo } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import {
  UserAvatar,
  TrustBadge,
  StarRating,
  Button
} from '../ui';
import { Picker } from '../../types/picker';
import { theme, cardStyles } from '../../styles/theme';

// Distance color helpers
function getDistanceColor(distance: number): string {
  if (distance < 2) return '#4caf50'; // green - nearby
  if (distance < 5) return '#ff9800'; // orange - close
  return '#f44336'; // red - far
}

function getDistanceLabel(distance: number): string {
  if (distance < 2) return 'Nearby';
  if (distance < 5) return 'Close';
  return 'Far';
}

interface PickerCardMemoProps {
  picker: Picker;
  onChat: (pickerId: string) => void;
  onSelect: (pickerId: string) => void;
}

export const PickerCardMemo = memo(function PickerCardMemo({
  picker,
  onChat,
  onSelect
}: PickerCardMemoProps) {
  return (
    <Box sx={cardStyles.base}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <UserAvatar
          type="picker"
          name={picker.fullName}
          src={picker.avatarUrl}
          online={picker.isOnline}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {picker.fullName}
            </Typography>
            {picker.isVerified && (
              <TrustBadge type="verified" verified size="small" showLabel={false} />
            )}
          </Stack>

          <StarRating
            value={picker.rating}
            readOnly
            size="small"
            showValue
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
            {picker.description}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              mb: 2,
              alignItems: 'center',
            }}
          >
            {picker.isPhoneVerified && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrustBadge type="phone" verified size="small" showLabel={false} />
              </Box>
            )}
            {picker.isEmailVerified && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrustBadge type="email" verified size="small" showLabel={false} />
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrustBadge type="delivery" verified value={picker.deliveryCount} size="small" showLabel={false} />
            </Box>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.colors.primary }}>
                  {picker.price} zl
                </Typography>
                {picker.distance > 0 && (
                  <Chip
                    label={`${picker.distance} km`}
                    size="small"
                    sx={{
                      backgroundColor: getDistanceColor(picker.distance),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {picker.estimatedTime ? `~${picker.estimatedTime} min` : `${picker.duration} min`}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onChat(picker.id)}
              >
                Chat
              </Button>
              <Button
                size="small"
                onClick={() => onSelect(picker.id)}
              >
                Select
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
});
'use client';

import { memo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import {
  UserAvatar,
  TrustBadge,
  StarRating,
  Button
} from '../ui';
import { Picker } from '../../types/picker';
import { theme, cardStyles } from '../../styles/theme';

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

          <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {picker.isPhoneVerified && (
              <TrustBadge type="phone" verified size="small" showLabel={false} />
            )}
            {picker.isEmailVerified && (
              <TrustBadge type="email" verified size="small" showLabel={false} />
            )}
            <TrustBadge type="delivery" verified value={picker.deliveryCount} size="small" showLabel={false} />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.colors.primary }}>
                {picker.price} zł
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {picker.duration} min
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
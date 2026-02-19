'use client';

import { useState, useEffect } from 'react';
import {
  SwipeableDrawer,
  Button,
  Box,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import {
  UserAvatar,
  TrustBadge,
  StarRating,
} from '../ui';
import { Picker } from '../../types/picker';
import { theme, cardStyles } from '../../styles/theme';

interface PickerCardModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  picker: Picker;
}

const Puller = () => (
  <Box
    sx={{
      width: 40,
      height: 4,
      backgroundColor: 'action.disabled',
      borderRadius: 2,
      position: 'absolute',
      top: 8,
      left: 'calc(50% - 20px)',
    }}
  />
);

export default function PickerCardModal({
  open,
  onClose,
  onEdit,
  picker,
}: PickerCardModalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Find the mobile container element
    const mobileContainer = document.querySelector('[data-mobile-container]') as HTMLElement;
    setContainer(mobileContainer);
  }, []);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      disablePortal
      container={container}
      ModalProps={{
        keepMounted: false,
      }}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          width: '100vw',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: 'background.paper',
          // Safe area padding for bottom sheet
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
      }}
    >
      <Puller />

      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        pt: 3,
        pb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          My Picker Card Preview
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, pb: 2, overflowY: 'auto' }}>
        {/* Полная карта пикера - как видят сендеры */}
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
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    {picker.price} zł
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {picker.duration} min
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center', fontStyle: 'italic' }}>
          This is how senders see your card
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{
        px: 3,
        py: 2,
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        gap: 2,
      }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Close
        </Button>
        <Button onClick={onEdit} variant="contained" fullWidth>
          Edit Card
        </Button>
      </Box>
    </SwipeableDrawer>
  );
}

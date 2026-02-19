'use client';

import { Dialog, DialogContent, DialogActions, Box, Typography } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { Button } from '../ui';

interface ConfirmPriceModalProps {
  isOpen: boolean;
  price: number;
  onConfirm: () => void;
  onCancel: () => void;
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

export function ConfirmPriceModal({ isOpen, price, onConfirm, onCancel }: ConfirmPriceModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      disablePortal={true}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-end',
        },
        '& .MuiDialog-paper': {
          width: '100vw',
          margin: 0,
          // Add safe area padding for bottom sheet modals
          marginBottom: 'env(safe-area-inset-bottom)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          borderRadius: '24px 24px 0 0',
          backgroundColor: 'background.paper',
          position: 'relative',
        },
      }}
    >
      <Puller />
      <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        {/* Warning Icon Circle */}
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'warning.light',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <WarningIcon sx={{ fontSize: 32, color: 'warning.dark' }} />
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
          You sure?
        </Typography>

        {/* Message */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Do you want to confirm the agreed price of{' '}
          <Typography component="span" fontWeight="bold" color="warning.dark">
            {price} zł
          </Typography>
          ?
        </Typography>

        {/* Warning Text */}
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 2, flexDirection: 'row' }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          fullWidth
          sx={{
            color: 'text.primary',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          No, Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: 'warning.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'warning.dark',
            },
          }}
        >
          Yes, Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

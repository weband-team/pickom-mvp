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
          maxWidth: '375px',
          width: '100%',
          margin: 0,
          marginBottom: 0,
          borderRadius: '16px 16px 0 0',
          backgroundColor: 'background.paper',
        },
      }}
    >
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

'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import { Button } from '../ui';
import { Warning } from '@mui/icons-material';

interface CancelOrderDialogProps {
  open: boolean;
  orderTrackingNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelOrderDialog({
  open,
  orderTrackingNumber,
  onConfirm,
  onCancel
}: CancelOrderDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          // Safe area padding for modals
          margin: 'var(--safe-area-top) var(--safe-area-right) var(--safe-area-bottom) var(--safe-area-left)',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: 'warning.main' }} />
          <Typography variant="h6">Cancel Order?</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Are you sure you want to cancel order <strong>{orderTrackingNumber}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          fullWidth
        >
          No, Keep Order
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          color="error"
          fullWidth
        >
          Yes, Cancel Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}

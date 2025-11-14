'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { LocationOn, Warning } from '@mui/icons-material';

interface LocationPermissionDialogProps {
  open: boolean;
  onRequestPermission: () => void;
  onClose?: () => void;
}

export default function LocationPermissionDialog({
  open,
  onRequestPermission,
  onClose,
}: LocationPermissionDialogProps) {
  const handleRequestPermission = () => {
    onRequestPermission();
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Location Permission Required
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="body1">
              To track your delivery in real-time, we need access to your location.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Your location will be shared with the sender and receiver only during active deliveries.
            This helps them know when to expect the package.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Location tracking stops automatically when the delivery is completed.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {onClose && (
          <Button
            onClick={handleClose}
            color="inherit"
          >
            Not Now
          </Button>
        )}
        <Button
          onClick={handleRequestPermission}
          variant="contained"
          startIcon={<LocationOn />}
          fullWidth={!onClose}
        >
          Enable Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}

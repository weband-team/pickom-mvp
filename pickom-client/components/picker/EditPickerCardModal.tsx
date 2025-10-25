'use client';

import { useState, useEffect } from 'react';
import {
  SwipeableDrawer,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { PickerCardSettings, savePickerSettings } from '../../data/mockPickerSettings';

interface EditPickerCardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: PickerCardSettings) => void;
  initialSettings: PickerCardSettings;
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

export default function EditPickerCardModal({
  open,
  onClose,
  onSave,
  initialSettings,
}: EditPickerCardModalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [price, setPrice] = useState(initialSettings.price);
  const [vehicle, setVehicle] = useState(initialSettings.vehicle);
  const [workArea, setWorkArea] = useState(initialSettings.workArea);
  const [bio, setBio] = useState(initialSettings.bio);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Find the mobile container element
    const mobileContainer = document.querySelector('[data-mobile-container]') as HTMLElement;
    setContainer(mobileContainer);
  }, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (price <= 0 || price > 1000) {
      newErrors.price = 'Price must be between 1 and 1000 zł';
    }

    if (bio.length > 200) {
      newErrors.bio = 'Bio must be 200 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const newSettings: PickerCardSettings = {
      price,
      vehicle,
      workArea,
      bio,
      isOnline: initialSettings.isOnline, // Keep current online status
    };

    savePickerSettings(newSettings);
    onSave(newSettings);
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial values
    setPrice(initialSettings.price);
    setVehicle(initialSettings.vehicle);
    setWorkArea(initialSettings.workArea);
    setBio(initialSettings.bio);
    setErrors({});
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleCancel}
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
          maxWidth: '375px',
          margin: '0 auto',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          backgroundColor: 'background.paper',
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
          Edit Picker Card
        </Typography>
        <IconButton onClick={handleCancel} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, pb: 2, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          <TextField
            label="Base Price (zł)"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            error={!!errors.price}
            helperText={errors.price || 'Your base delivery price'}
            fullWidth
            inputProps={{ min: 1, max: 1000 }}
          />

          <FormControl fullWidth>
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={vehicle}
              label="Vehicle Type"
              onChange={(e) => setVehicle(e.target.value as any)}
            >
              <MenuItem value="car">🚗 Car</MenuItem>
              <MenuItem value="bike">🚴 Bike</MenuItem>
              <MenuItem value="scooter">🛴 Scooter</MenuItem>
              <MenuItem value="walking">🚶 Walking</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Work Area/Zone"
            value={workArea}
            onChange={(e) => setWorkArea(e.target.value)}
            fullWidth
            helperText="E.g., City Center, Downtown, etc."
          />

          <TextField
            label="Bio/Description"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            multiline
            rows={4}
            fullWidth
            error={!!errors.bio}
            helperText={errors.bio || `${bio.length}/200 characters`}
            inputProps={{ maxLength: 200 }}
          />
        </Box>
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
        <Button onClick={handleCancel} variant="outlined" fullWidth>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" fullWidth>
          Save Changes
        </Button>
      </Box>
    </SwipeableDrawer>
  );
}

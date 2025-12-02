'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import CardsList from './CardsList';
import AddCardForm from './AddCardForm';

interface PaymentMethodSelectorProps {
  open: boolean;
  onClose: () => void;
  onCardSelected: (cardId: string) => void;
  title?: string;
}

/**
 * PaymentMethodSelector component - modal for selecting payment method
 * Features:
 * - List of saved cards (selectable)
 * - Option to add new card inline
 * - Material UI Dialog
 */
export default function PaymentMethodSelector({
  open,
  onClose,
  onCardSelected,
  title = 'Select Payment Method',
}: PaymentMethodSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCardSelect = (cardId: string) => {
    onCardSelected(cardId);
    onClose();
  };

  const handleAddCardSuccess = () => {
    setShowAddForm(false);
    // List will automatically refresh
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {showAddForm ? (
          <AddCardForm
            onSuccess={handleAddCardSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <Stack spacing={2}>
            <CardsList
              onCardSelect={handleCardSelect}
              selectable
              showActions={false}
            />

            <Divider sx={{ my: 2 }} />

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowAddForm(true)}
              fullWidth
              size="large"
            >
              Add New Card
            </Button>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

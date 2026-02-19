'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Add, ArrowBack, Close } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import CardsList from '../components/payment/CardsList';
import AddCardForm from '../components/payment/AddCardForm';

/**
 * Payment Methods page - manage saved payment cards
 * Features:
 * - View all saved cards
 * - Add new card
 * - Delete card
 * - Set default card
 */
export default function PaymentMethodsPage() {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddCardSuccess = () => {
    setShowAddDialog(false);
    setRefreshKey((prev) => prev + 1); // Force refresh CardsList
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Payment Methods
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage your saved payment cards
        </Typography>
      </Box>

      {/* Add Card Button */}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setShowAddDialog(true)}
        sx={{ mb: 3 }}
        size="large"
      >
        Add New Card
      </Button>

      {/* Cards List */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <CardsList key={refreshKey} showActions />
      </Paper>

      {/* Add Card Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add Payment Card
          <IconButton onClick={() => setShowAddDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddCardForm
            onSuccess={handleAddCardSuccess}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

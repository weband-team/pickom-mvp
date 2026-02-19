'use client';

import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Stack } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CardItem, { PaymentCard } from './CardItem';

interface CardsListProps {
  onCardSelect?: (cardId: string) => void;
  selectable?: boolean;
  showActions?: boolean;
}

/**
 * CardsList component displays all saved payment cards
 * Features:
 * - Fetches cards from backend
 * - Delete card functionality
 * - Set default card functionality
 * - Optional selection mode
 * - Loading and error states
 */
export default function CardsList({
  onCardSelect,
  selectable = false,
  showActions = true,
}: CardsListProps) {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCards = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.get<PaymentCard[]>(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/cards`,
        { withCredentials: true }
      );
      setCards(data);
    } catch (err) {
      console.error('Error fetching cards:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || 'Failed to load cards';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/cards/${cardId}`,
        { withCredentials: true }
      );
      toast.success('Card deleted successfully');
      fetchCards(); // Refresh list
    } catch (err) {
      console.error('Error deleting card:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || 'Failed to delete card';
      toast.error(errorMessage);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/cards/${cardId}/default`,
        {},
        { withCredentials: true }
      );
      toast.success('Default card updated');
      fetchCards(); // Refresh list
    } catch (err) {
      console.error('Error setting default card:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || 'Failed to set default card';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (cards.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No payment cards saved yet. Add a card to get started.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onDelete={showActions ? handleDelete : undefined}
          onSetDefault={showActions ? handleSetDefault : undefined}
          onSelect={onCardSelect}
          selectable={selectable}
        />
      ))}
    </Stack>
  );
}

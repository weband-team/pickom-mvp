'use client';

import { Box, Typography, Button, Chip, Stack, Divider } from '@mui/material';
import { Chat, CheckCircle, Cancel, AttachMoney } from '@mui/icons-material';
import PickerCardComponent, { PickerCardData } from '@/components/picker/PickerCardComponent';

export interface OfferData {
  id: number;
  pickerId: string;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface OfferCardProps {
  offer: OfferData;
  picker: PickerCardData;
  originalPrice: number;
  onChat: () => void;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export default function OfferCard({
  offer,
  picker,
  originalPrice,
  onChat,
  onAccept,
  onReject,
  disabled = false
}: OfferCardProps) {
  const priceDifference = offer.price - originalPrice;
  const pricePercentage = ((priceDifference / originalPrice) * 100).toFixed(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const isPending = offer.status === 'pending';

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: 2,
        borderColor: offer.status === 'accepted' ? 'success.main' :
                     offer.status === 'rejected' ? 'error.light' : 'divider',
        opacity: offer.status === 'rejected' ? 0.7 : 1,
        transition: 'all 0.2s',
      }}
    >
      {/* Status badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Chip
          label={getStatusLabel(offer.status)}
          size="small"
          color={getStatusColor(offer.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
          sx={{ fontWeight: 600 }}
        />
        <Typography variant="caption" color="text.secondary">
          {new Date(offer.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
      </Box>

      {/* Picker information */}
      <PickerCardComponent picker={picker} variant="full" />

      <Divider sx={{ my: 2 }} />

      {/* Price comparison */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Price Comparison
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Offered Price
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoney sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {offer.price} zł
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Your Price
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {originalPrice} zł
            </Typography>
          </Box>

          {priceDifference !== 0 && (
            <Chip
              label={`${priceDifference > 0 ? '+' : ''}${pricePercentage}%`}
              size="small"
              color={priceDifference < 0 ? 'success' : 'warning'}
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
          )}
        </Stack>
      </Box>

      {/* Message from picker */}
      {offer.message && (
        <Box
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 1,
            backgroundColor: 'action.hover',
            borderLeft: 3,
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Message from picker
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            "{offer.message}"
          </Typography>
        </Box>
      )}

      {/* Action buttons */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<Chat />}
          onClick={onChat}
          disabled={disabled}
          fullWidth
          sx={{ textTransform: 'none' }}
        >
          Chat
        </Button>

        {isPending && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={onAccept}
              disabled={disabled}
              fullWidth
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Accept
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={onReject}
              disabled={disabled}
              fullWidth
              sx={{ textTransform: 'none' }}
            >
              Reject
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}

'use client';

import { memo } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { Button, UserAvatar } from '../ui';
import { Order, formatRoute, getStatusColor, getStatusLabel } from '@/types/order';
import { colors } from '@/theme/colors';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
  onContactPicker?: (orderId: string) => void;
}

export const OrderCard = memo(function OrderCard({
  order,
  onViewDetails,
  onContactPicker,
}: OrderCardProps) {
  const pickupDate = format(order.pickupDateTime, 'MMM dd, yyyy');
  const pickupTime = format(order.pickupDateTime, 'HH:mm');

  const canContact = order.picker && onContactPicker;

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        p: 2,
        mb: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="caption" color="text.secondary">
          {order.trackingNumber}
        </Typography>
        <Chip
          label={getStatusLabel(order.status)}
          size="small"
          sx={{
            backgroundColor: getStatusColor(order.status),
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.75rem',
          }}
        />
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Route
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
          {formatRoute(order)}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Pickup Date
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {pickupDate}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Time
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {pickupTime}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary.main }}>
          {order.price} {order.currency}
        </Typography>
      </Box>

      {order.picker && (
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Picker
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserAvatar
              type="picker"
              name={order.picker.fullName}
              src={order.picker.avatarUrl}
              size="small"
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {order.picker.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ⭐ {order.picker.rating.toFixed(1)}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onViewDetails(order.id)}
          fullWidth
        >
          View Details
        </Button>
        {canContact && (
          <Button
            variant="contained"
            size="small"
            onClick={() => onContactPicker(order.id)}
            fullWidth
          >
            Contact
          </Button>
        )}
      </Stack>
    </Box>
  );
});

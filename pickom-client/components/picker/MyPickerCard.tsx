'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Box, Typography, Button, Chip } from '@mui/material';
import { CheckCircle, Cancel, Visibility, Edit } from '@mui/icons-material';

interface MyPickerCardProps {
  isOnline: boolean;
  price: number;
  rating: number;
  onToggleOnline: () => void;
  onViewCard: () => void;
  onEdit: () => void;
}

export default function MyPickerCard({
  isOnline,
  price,
  rating,
  onToggleOnline,
  onViewCard,
  onEdit,
}: MyPickerCardProps) {
  // Fix hydration mismatch by syncing client state after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a stable initial value during SSR
  const displayIsOnline = mounted ? isOnline : false;

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: 'background.paper',
        borderLeft: 4,
        borderColor: 'divider',
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {displayIsOnline ? (
              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
            ) : (
              <Cancel sx={{ color: 'grey.500', fontSize: 20 }} />
            )}
            <Typography variant="subtitle2" fontWeight={600}>
              My Picker Card
            </Typography>
            <Chip
              label={displayIsOnline ? 'Online' : 'Offline'}
              size="small"
              color={displayIsOnline ? 'success' : 'default'}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Base price: <strong>{price} zł</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rating: <strong>⭐ {rating.toFixed(1)}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={displayIsOnline ? 'outlined' : 'contained'}
            color="success"
            size="small"
            onClick={onToggleOnline}
            sx={{ flex: '1 1 auto', minHeight: 44 }}
          >
            {displayIsOnline ? 'Go Offline' : 'Go Online'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            onClick={onViewCard}
            sx={{ flex: '1 1 auto', minHeight: 44 }}
          >
            View Card
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{ flex: '0 1 auto', minHeight: 44, minWidth: 44, px: 1 }}
          >
            Edit
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

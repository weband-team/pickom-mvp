'use client';

import { Box, Typography, Chip, IconButton } from '@mui/material';
import { Delete, CheckCircle } from '@mui/icons-material';
import CardBrandIcon from './CardBrandIcon';

export interface PaymentCard {
  id: string;
  brand: string;
  lastFourDigits: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface CardItemProps {
  card: PaymentCard;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onSelect?: (id: string) => void;
  selectable?: boolean;
}

/**
 * CardItem component displays a single payment card
 * Features:
 * - Card brand icon (Visa, MC, Amex, etc.)
 * - Last 4 digits and expiration
 * - Default card indicator
 * - Delete and set default actions
 * - Optional selection mode
 */
export default function CardItem({
  card,
  onDelete,
  onSetDefault,
  onSelect,
  selectable = false,
}: CardItemProps) {
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(card.id);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        p: 2,
        border: 1,
        borderColor: card.isDefault ? 'primary.main' : 'divider',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: selectable ? 'pointer' : 'default',
        '&:hover': selectable
          ? {
              backgroundColor: 'action.hover',
            }
          : {},
      }}
    >
      {/* Card Brand Icon */}
      <CardBrandIcon brand={card.brand} size="medium" />

      {/* Card Information */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          •••• {card.lastFourDigits}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
        </Typography>
      </Box>

      {/* Default Badge */}
      {card.isDefault && (
        <Chip
          label="Default"
          size="small"
          color="primary"
          icon={<CheckCircle />}
          sx={{ mr: 1 }}
        />
      )}

      {/* Set Default Button */}
      {!card.isDefault && onSetDefault && (
        <Chip
          label="Set Default"
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault(card.id);
          }}
          clickable
        />
      )}

      {/* Delete Button */}
      {onDelete && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          color="error"
          size="small"
        >
          <Delete />
        </IconButton>
      )}
    </Box>
  );
}

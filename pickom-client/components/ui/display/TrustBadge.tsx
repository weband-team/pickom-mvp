import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import {
  Verified,
  Shield,
  Phone,
  Email,
  CreditCard,
  LocalShipping,
  Star,
  CheckCircle,
} from '@mui/icons-material';

export type TrustBadgeType =
  | 'verified'
  | 'identity'
  | 'phone'
  | 'email'
  | 'payment'
  | 'delivery'
  | 'rating'
  | 'completion';

export interface TrustBadgeProps {
  type: TrustBadgeType;
  verified?: boolean;
  value?: string | number;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  tooltip?: string;
}

const badgeConfig = {
  verified: {
    icon: Verified,
    label: 'Verified',
    color: '#000000',
    tooltip: 'This user has been verified by Pickom',
  },
  identity: {
    icon: Shield,
    label: 'ID Verified',
    color: '#000000',
    tooltip: 'Identity documents have been verified',
  },
  phone: {
    icon: Phone,
    label: 'Phone Verified',
    color: '#000000',
    tooltip: 'Phone number has been verified',
  },
  email: {
    icon: Email,
    label: 'Email Verified',
    color: '#000000',
    tooltip: 'Email address has been verified',
  },
  payment: {
    icon: CreditCard,
    label: 'Payment Verified',
    color: '#000000',
    tooltip: 'Payment method has been verified',
  },
  delivery: {
    icon: LocalShipping,
    label: 'Deliveries',
    color: '#000000',
    tooltip: 'Number of successful deliveries',
  },
  rating: {
    icon: Star,
    label: 'Rating',
    color: '#000000',
    tooltip: 'Average user rating',
  },
  completion: {
    icon: CheckCircle,
    label: 'Completion Rate',
    color: '#000000',
    tooltip: 'Order completion rate',
  },
};

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  type,
  verified = true,
  value,
  size = 'medium',
  showLabel = true,
  tooltip,
}) => {
  const config = badgeConfig[type];
  const IconComponent = config.icon;

  const iconSize = size === 'small' ? 16 : 20;
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  const getDisplayValue = () => {
    if (value !== undefined) {
      if (type === 'rating') {
        return `${value}/5`;
      }
      if (type === 'completion') {
        return `${value}%`;
      }
      return value.toString();
    }
    return '';
  };

  const badge = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: '16px',
        backgroundColor: verified ? config.color : 'transparent',
        color: verified ? '#ffffff' : config.color,
        border: verified ? 'none' : `1px solid ${config.color}`,
        ...(size === 'small' && {
          height: 24,
          px: 1,
          py: 0,
        }),
      }}
    >
      <IconComponent sx={{ fontSize: iconSize }} />
      {showLabel && (
        <Typography variant="caption" sx={{ fontSize, lineHeight: 1 }}>
          {config.label}
        </Typography>
      )}
      {value !== undefined && (
        <Typography variant="caption" sx={{ fontSize, fontWeight: 'bold', lineHeight: 1 }}>
          {getDisplayValue()}
        </Typography>
      )}
    </Box>
  );

  if (tooltip || config.tooltip) {
    return (
      <Tooltip title={tooltip || config.tooltip}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
};
'use client';

import { SvgIcon, SvgIconProps } from '@mui/material';
import { CreditCard } from '@mui/icons-material';

// Visa Icon
const VisaIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 32">
    <rect width="48" height="32" rx="4" fill="#1434CB" />
    <text
      x="24"
      y="20"
      fontSize="12"
      fill="white"
      textAnchor="middle"
      fontWeight="bold"
    >
      VISA
    </text>
  </SvgIcon>
);

// Mastercard Icon
const MastercardIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 32">
    <rect width="48" height="32" rx="4" fill="#000000" />
    <circle cx="19" cy="16" r="8" fill="#EB001B" />
    <circle cx="29" cy="16" r="8" fill="#F79E1B" />
  </SvgIcon>
);

// American Express Icon
const AmexIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 32">
    <rect width="48" height="32" rx="4" fill="#006FCF" />
    <text
      x="24"
      y="20"
      fontSize="10"
      fill="white"
      textAnchor="middle"
      fontWeight="bold"
    >
      AMEX
    </text>
  </SvgIcon>
);

// MIR Icon
const MirIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 32">
    <rect width="48" height="32" rx="4" fill="#4DB45E" />
    <text
      x="24"
      y="20"
      fontSize="12"
      fill="white"
      textAnchor="middle"
      fontWeight="bold"
    >
      MIR
    </text>
  </SvgIcon>
);

// Discover Icon
const DiscoverIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 32">
    <rect width="48" height="32" rx="4" fill="#FF6000" />
    <text
      x="24"
      y="20"
      fontSize="9"
      fill="white"
      textAnchor="middle"
      fontWeight="bold"
    >
      DISCOVER
    </text>
  </SvgIcon>
);

interface CardBrandIconProps {
  brand:
    | 'visa'
    | 'mastercard'
    | 'amex'
    | 'discover'
    | 'mir'
    | 'unionpay'
    | 'unknown'
    | string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * CardBrandIcon component displays payment card brand icons
 * Supports: Visa, Mastercard, Amex, Mir, Discover
 * Falls back to generic CreditCard icon for unknown brands
 */
export default function CardBrandIcon({
  brand,
  size = 'medium',
}: CardBrandIconProps) {
  const sizeMap = {
    small: { width: 32, height: 20 },
    medium: { width: 48, height: 32 },
    large: { width: 64, height: 42 },
  };

  const brandIcons: Record<string, typeof VisaIcon> = {
    visa: VisaIcon,
    mastercard: MastercardIcon,
    amex: AmexIcon,
    'american express': AmexIcon,
    mir: MirIcon,
    discover: DiscoverIcon,
  };

  const IconComponent = brandIcons[brand.toLowerCase()] || CreditCard;

  return <IconComponent sx={sizeMap[size]} />;
}

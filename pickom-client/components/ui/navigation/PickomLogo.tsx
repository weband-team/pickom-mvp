import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';

export interface PickomLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'text' | 'full';
  color?: 'black' | 'white';
}

const sizeMap = {
  small: {
    icon: 24,
    text: '1.25rem',
  },
  medium: {
    icon: 32,
    text: '1.5rem',
  },
  large: {
    icon: 48,
    text: '2rem',
  },
};

export const PickomLogo: React.FC<PickomLogoProps> = ({
  size = 'medium',
  variant = 'full',
  color = 'black',
}) => {
  const iconColor = color === 'white' ? '#ffffff' : '#000000';
  const textColor = color === 'white' ? '#ffffff' : '#000000';

  const renderIcon = () => (
    <SvgIcon
      sx={{
        fontSize: sizeMap[size].icon,
        color: iconColor,
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        <circle cx="12" cy="12" r="2" fill={iconColor} />
      </svg>
    </SvgIcon>
  );

  const renderText = () => (
    <Typography
      variant="h6"
      component="span"
      sx={{
        fontSize: sizeMap[size].text,
        fontWeight: 'bold',
        color: textColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      Pickom
    </Typography>
  );

  if (variant === 'icon') {
    return renderIcon();
  }

  if (variant === 'text') {
    return renderText();
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {renderIcon()}
      {renderText()}
    </Box>
  );
};
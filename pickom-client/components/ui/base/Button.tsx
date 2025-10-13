'use client';

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text';
  loading?: boolean;
  selected?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  loading = false,
  selected = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      disabled={disabled || loading}
      aria-pressed={selected}
      className={selected ? 'Mui-selected' : undefined}
      {...props}
      sx={{
        position: 'relative',
        ...(selected && variant === 'contained' && {
          backgroundColor: '#ffffff !important',
          color: '#000000 !important',
          border: '1px solid #000000',
          '&:hover': {
            backgroundColor: '#f5f5f5 !important',
          },
        }),
        ...props.sx,
      }}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            position: 'absolute',
            color: 'inherit',
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </MuiButton>
  );
};
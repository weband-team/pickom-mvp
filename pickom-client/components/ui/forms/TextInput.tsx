import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';

export interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

export const TextInput: React.FC<TextInputProps> = ({
  variant = 'outlined',
  icon,
  iconPosition = 'start',
  InputProps,
  ...props
}) => {
  const inputProps = icon
    ? {
        ...InputProps,
        [iconPosition === 'start' ? 'startAdornment' : 'endAdornment']: (
          <InputAdornment position={iconPosition}>{icon}</InputAdornment>
        ),
      }
    : InputProps;

  return (
    <TextField
      variant={variant}
      fullWidth
      {...props}
      InputProps={inputProps}
      sx={{
        '& .MuiOutlinedInput-root': {
          minHeight: 48,
          '& input': {
            padding: '14px 16px',
          },
          '& textarea': {
            padding: '14px 16px',
          },
        },
        ...props.sx,
      }}
    />
  );
};
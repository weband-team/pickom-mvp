import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
}

export const TextInput: React.FC<TextInputProps> = ({
  variant = 'outlined',
  ...props
}) => {
  return (
    <TextField
      variant={variant}
      fullWidth
      {...props}
      sx={{
        minHeight: 44,
        ...props.sx,
      }}
    />
  );
};
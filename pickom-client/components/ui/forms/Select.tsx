'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  SelectProps as MuiSelectProps,
  SelectChangeEvent,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<MuiSelectProps, 'value' | 'onChange'> {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error = false,
  helperText,
  placeholder,
  disabled = false,
  ...props
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    if (onChange) {
      onChange(event.target.value as string | number);
    }
  };

  const labelId = label ? `select-label-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      {label && (
        <InputLabel id={labelId} shrink={!!value || !!placeholder}>
          {label}
        </InputLabel>
      )}
      <MuiSelect
        labelId={labelId}
        value={value || ''}
        // @ts-expect-error - MUI Select type mismatch, but functionally correct
        onChange={handleChange}
        label={label}
        displayEmpty={!!placeholder}
        {...props}
        sx={{
          minHeight: 44,
          ...props.sx,
        }}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
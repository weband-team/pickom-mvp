'use client';

import React, { memo, useCallback } from 'react';
import { Box, Slider, Typography, SliderProps } from '@mui/material';
import { theme } from '../../styles/theme';

export interface PriceSliderProps extends Omit<SliderProps, 'value' | 'onChange'> {
  value?: number | number[];
  onChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  showLabels?: boolean;
  showValue?: boolean;
  label?: string;
  range?: boolean;
}

const PriceSliderComponent = ({
  value,
  onChange,
  min = 0,
  max = 5000,
  step = 50,
  currency = ' zł',
  showLabels = true,
  showValue = true,
  label = 'Price Range',
  range = false,
  disabled = false,
  ...props
}: PriceSliderProps) => {
  const handleChange = useCallback((event: Event, newValue: number | number[]) => {
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  const formatValue = useCallback((val: number) => {
    return `${val.toLocaleString()}${currency}`;
  }, [currency]);

  const getDisplayValue = useCallback(() => {
    if (Array.isArray(value)) {
      return `${formatValue(value[0])} - ${formatValue(value[1])}`;
    }
    return formatValue(value as number);
  }, [value, formatValue]);

  const defaultValue = range ? [min, max] : min;
  const currentValue = value !== undefined ? value : defaultValue;

  return (
    <Box sx={{ width: '100%', px: 1 }}>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {label && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="body2" sx={{ color: '#666666', fontWeight: 500 }}>
              {getDisplayValue()}
            </Typography>
          )}
        </Box>
      )}

      <Slider
        value={currentValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        valueLabelDisplay="auto"
        valueLabelFormat={formatValue}
        sx={{
          color: theme.colors.textPrimary,
          '& .MuiSlider-track': {
            backgroundColor: theme.colors.textPrimary,
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            backgroundColor: theme.colors.textPrimary,
            border: `2px solid ${theme.colors.white}`,
            '&:hover': {
              boxShadow: '0px 0px 0px 8px rgba(0, 0, 0, 0.16)',
            },
            '&.Mui-focusVisible': {
              boxShadow: '0px 0px 0px 8px rgba(0, 0, 0, 0.16)',
            },
          },
          '& .MuiSlider-rail': {
            backgroundColor: theme.colors.border,
          },
          '& .MuiSlider-valueLabel': {
            backgroundColor: theme.colors.textPrimary,
            color: theme.colors.white,
            '&::before': {
              borderTopColor: theme.colors.textPrimary,
            },
          },
        }}
        {...props}
      />

      {showLabels && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#666666' }}>
            {formatValue(min)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666666' }}>
            {formatValue(max)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const PriceSlider = memo(PriceSliderComponent);
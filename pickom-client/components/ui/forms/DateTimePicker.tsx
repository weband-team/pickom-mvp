'use client';

import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TextFieldProps } from '@mui/material';

export interface DateTimePickerProps {
  type?: 'date' | 'time' | 'datetime';
  label?: string;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  textFieldProps?: Partial<TextFieldProps>;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  type = 'date',
  label,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  textFieldProps = {},
}) => {
  const commonProps = {
    label,
    value,
    onChange,
    disabled,
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    slotProps: {
      textField: {
        error,
        helperText,
        fullWidth: true,
        sx: {
          minHeight: 44,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#000000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
              borderWidth: 2,
            },
          },
        },
        ...textFieldProps,
      },
    },
  };

  const renderPicker = () => {
    switch (type) {
      case 'time':
        return <TimePicker {...commonProps} />;
      case 'datetime':
        return <MuiDateTimePicker {...commonProps} />;
      case 'date':
      default:
        return <DatePicker {...commonProps} />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {renderPicker()}
    </LocalizationProvider>
  );
};
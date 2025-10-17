'use client';

import { useState } from 'react';
import { Box, Stack, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TextInput } from '../ui';

interface ReceiverSelectorProps {
  recipientId: string;
  recipientPhone: string;
  onRecipientIdChange: (value: string) => void;
  onRecipientPhoneChange: (value: string) => void;
}

type ReceiverType = 'none' | 'userId' | 'phone';

export function ReceiverSelector({
  recipientId,
  recipientPhone,
  onRecipientIdChange,
  onRecipientPhoneChange,
}: ReceiverSelectorProps) {
  const [receiverType, setReceiverType] = useState<ReceiverType>(() => {
    if (recipientId) return 'userId';
    if (recipientPhone) return 'phone';
    return 'none';
  });

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ReceiverType | null) => {
    if (newType === null) return;

    setReceiverType(newType);

    if (newType === 'none') {
      onRecipientIdChange('');
      onRecipientPhoneChange('');
    } else if (newType === 'userId') {
      onRecipientPhoneChange('');
    } else if (newType === 'phone') {
      onRecipientIdChange('');
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Receiver (Optional)
      </Typography>

      <ToggleButtonGroup
        value={receiverType}
        exclusive
        onChange={handleTypeChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="none">
          No Receiver
        </ToggleButton>
        <ToggleButton value="userId">
          User ID
        </ToggleButton>
        <ToggleButton value="phone">
          Phone Number
        </ToggleButton>
      </ToggleButtonGroup>

      {receiverType === 'userId' && (
        <TextInput
          label="Receiver User ID"
          value={recipientId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRecipientIdChange(e.target.value)}
          placeholder="Enter user ID"
          fullWidth
        />
      )}

      {receiverType === 'phone' && (
        <TextInput
          label="Receiver Phone Number"
          type="tel"
          value={recipientPhone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRecipientPhoneChange(e.target.value)}
          placeholder="+1234567890"
          fullWidth
        />
      )}
    </Box>
  );
}

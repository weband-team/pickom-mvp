'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, ToggleButtonGroup, ToggleButton, MenuItem, CircularProgress } from '@mui/material';
import { TextInput, Select } from '../ui';
import { getAllUsers } from '@/app/api/user';
import { User } from '@/app/api/dto/user';

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

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (receiverType === 'userId') {
      setLoadingUsers(true);
      getAllUsers()
        .then((response) => {
          setUsers(response.users);
        })
        .catch((error) => {
          console.error('Failed to load users:', error);
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [receiverType]);

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
        loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Select
            label="Select Receiver"
            value={recipientId}
            onChange={(value) => onRecipientIdChange(value)}
            options={users.map((user) => ({
              value: user.uid,
              label: `${user.name} (${user.email})`,
            }))}
            placeholder="Choose a user"
          />
        )
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

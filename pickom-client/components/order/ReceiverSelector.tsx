'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Stack, Typography, ToggleButtonGroup, ToggleButton, CircularProgress, Alert, Avatar, Chip } from '@mui/material';
import { TextInput } from '../ui';
import { findReceiver, ReceiverInfo } from '@/app/api/delivery';

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

  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundReceiver, setFoundReceiver] = useState<ReceiverInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFoundReceiver(null);
      setSearchError(null);
      onRecipientIdChange('');
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const response = await findReceiver(query.trim());

      if (response.data) {
        setFoundReceiver(response.data);
        onRecipientIdChange(response.data.uid);
        setSearchError(null);
      } else {
        setFoundReceiver(null);
        onRecipientIdChange('');
        setSearchError('User not found');
      }
    } catch (error: any) {
      console.error('Failed to find receiver:', error);
      setFoundReceiver(null);
      onRecipientIdChange('');
      setSearchError('Failed to search. Please try again.');
    } finally {
      setSearching(false);
    }
  }, [onRecipientIdChange]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ReceiverType | null) => {
    if (newType === null) return;

    setReceiverType(newType);
    setSearchInput('');
    setFoundReceiver(null);
    setSearchError(null);

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
          Email / ID
        </ToggleButton>
        <ToggleButton value="phone">
          Phone Number
        </ToggleButton>
      </ToggleButtonGroup>

      {receiverType === 'userId' && (
        <Stack spacing={2}>
          <TextInput
            label="Search by Email or User ID"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Enter email or user ID"
            fullWidth
          />

          {searching && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}

          {searchError && !searching && (
            <Alert severity="warning">{searchError}</Alert>
          )}

          {foundReceiver && !searching && (
            <Box
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: 'success.main',
                borderRadius: 2,
                backgroundColor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {foundReceiver.avatarUrl && (
                <Avatar
                  src={foundReceiver.avatarUrl}
                  alt={foundReceiver.name}
                  sx={{ width: 48, height: 48 }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {foundReceiver.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {foundReceiver.email}
                </Typography>
              </Box>
              <Chip label="Found" color="success" size="small" />
            </Box>
          )}
        </Stack>
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

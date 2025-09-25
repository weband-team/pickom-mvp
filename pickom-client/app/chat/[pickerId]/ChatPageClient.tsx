'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, Stack, IconButton, Paper } from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import {
  MobileContainer,
  PickomLogo,
  UserAvatar,
  TrustBadge,
  StarRating,
  Button,
  TextInput
} from '../../../components/ui';
import { ChatRoll, ChatMessage, ConfirmPriceModal } from '../../../components';
import { mockChatSession } from '../../../data/mockChat';
import { Message } from '../../../types/chat';
import { Picker } from '../../../types/picker';

interface ChatPageClientProps {
  picker: Picker;
  pickerId: string;
}

export function ChatPageClient({ picker, pickerId }: ChatPageClientProps) {
  const [messages, setMessages] = useState<Message[]>(mockChatSession.messages);
  const [newMessage, setNewMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Convert messages to ChatMessage format
  const chatMessages: ChatMessage[] = messages.map(msg => ({
    id: msg.id,
    text: msg.content,
    timestamp: msg.timestamp,
    sender: {
      id: msg.senderId,
      name: msg.senderName,
      type: msg.isFromPicker ? 'picker' : 'customer',
    },
    isOwn: !msg.isFromPicker
  }));

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        senderId: 'customer-1',
        senderName: 'You',
        content: newMessage.trim(),
        timestamp: new Date(),
        isFromPicker: false
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate picker response after a delay
      setTimeout(() => {
        const pickerResponse: Message = {
          id: `msg-${Date.now()}-picker`,
          senderId: pickerId,
          senderName: picker.fullName,
          content: "Got it! Thanks for the message.",
          timestamp: new Date(),
          isFromPicker: true
        };
        setMessages(prev => [...prev, pickerResponse]);
      }, 1000 + Math.random() * 2000);
    }
  }, [newMessage, pickerId, picker.fullName]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirmPrice = () => {
    setShowConfirmModal(true);
  };

  const handleModalConfirm = () => {
    setIsConfirmed(true);
    setShowConfirmModal(false);

    // Add system message about confirmation
    const confirmMessage: Message = {
      id: `msg-${Date.now()}-confirm`,
      senderId: 'system',
      senderName: 'System',
      content: `✅ Price confirmed! You have agreed to pay ${mockChatSession.deliveryInfo.agreedPrice} ₽ for this delivery.`,
      timestamp: new Date(),
      isFromPicker: false
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleModalCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <MobileContainer showFrame={false}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => window.history.back()}
                size="small"
                sx={{ p: 1 }}
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Chat with {picker.fullName}
                </Typography>
              </Box>
              <PickomLogo variant="icon" size="small" />
            </Stack>
          </Box>

          {/* Picker Info Header */}
          <Paper sx={{ m: 2, p: 2, backgroundColor: '#f5f5f5' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <UserAvatar
                type="picker"
                name={picker.fullName}
                src={picker.avatarUrl}
                online={picker.isOnline}
              />
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {picker.fullName}
                  </Typography>
                  {picker.isVerified && (
                    <TrustBadge type="verified" verified size="small" showLabel={false} />
                  )}
                </Stack>
                <StarRating value={picker.rating} readOnly size="small" showValue />
                <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {picker.isPhoneVerified && (
                    <TrustBadge type="phone" verified size="small" showLabel={false} />
                  )}
                  {picker.isEmailVerified && (
                    <TrustBadge type="email" verified size="small" showLabel={false} />
                  )}
                  <TrustBadge type="delivery" verified value={picker.deliveryCount} size="small" showLabel={false} />
                </Stack>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {mockChatSession.deliveryInfo.agreedPrice}₽
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estimated: 2-3 hours
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Chat Messages */}
          <Box sx={{ flex: 1, overflow: 'hidden', mx: 2 }}>
            <ChatRoll
              messages={chatMessages}
              height="100%"
            />
          </Box>

          {/* Message Input & Actions */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <Stack spacing={2}>
              {/* Message Input */}
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextInput
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isConfirmed}
                  multiline
                  maxRows={3}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isConfirmed}
                  sx={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333',
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
                      color: '#999999',
                    },
                  }}
                >
                  <Send fontSize="small" />
                </IconButton>
              </Stack>

              {/* Confirm Price Button */}
              <Button
                onClick={handleConfirmPrice}
                disabled={isConfirmed}
                fullWidth
                sx={{
                  ...(isConfirmed && {
                    backgroundColor: '#4caf50',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                  }),
                }}
              >
                {isConfirmed
                  ? '✅ Price Confirmed!'
                  : `Confirm Price (${mockChatSession.deliveryInfo.agreedPrice}₽)`
                }
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Confirm Modal */}
        <ConfirmPriceModal
          isOpen={showConfirmModal}
          price={mockChatSession.deliveryInfo.agreedPrice}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      </MobileContainer>
    </Box>
  );
}
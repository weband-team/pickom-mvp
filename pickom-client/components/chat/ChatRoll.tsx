'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { UserAvatar } from '../ui';

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    type: 'customer' | 'picker';
    avatar?: string;
  };
  isOwn?: boolean;
}

export interface ChatRollProps {
  messages: ChatMessage[];
  height?: number | string;
  autoScroll?: boolean;
}

export const ChatRoll: React.FC<ChatRollProps> = ({
  messages,
  height = 400,
  autoScroll = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <Box
      sx={{
        height,
        overflow: 'auto',
        padding: 1,
        backgroundColor: '#fafafa',
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              maxWidth: '70%',
              flexDirection: message.isOwn ? 'row-reverse' : 'row',
            }}
          >
            <UserAvatar
              type={message.sender.type}
              name={message.sender.name}
              src={message.sender.avatar}
              size="small"
            />
            <Box>
              <Paper
                elevation={1}
                sx={{
                  padding: 1.5,
                  backgroundColor: message.isOwn ? '#000000' : '#ffffff',
                  color: message.isOwn ? '#ffffff' : '#000000',
                  borderRadius: 2,
                  borderTopLeftRadius: message.isOwn ? 2 : 0.5,
                  borderTopRightRadius: message.isOwn ? 0.5 : 2,
                }}
              >
                <Typography variant="body2">
                  {message.text}
                </Typography>
              </Paper>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  color: '#666666',
                  textAlign: message.isOwn ? 'right' : 'left',
                }}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};
'use client';

import { Box, Typography, Avatar } from '@mui/material';
import { ChatSession } from '@/types/chat';

interface ChatListItemProps {
  chatSession: ChatSession;
  onClick: () => void;
  unread?: boolean;
}

const getStatusColor = (status: ChatSession['status']) => {
  switch (status) {
    case 'active':
      return '#FFC107'; // Yellow
    case 'price_confirmed':
      return '#2196F3'; // Blue
    case 'completed':
      return '#4CAF50'; // Green
    case 'cancelled':
      return '#9E9E9E'; // Grey
    default:
      return '#9E9E9E';
  }
};

const getRelativeTime = (timestamp: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - timestamp.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chatSession,
  onClick,
  unread = false,
}) => {
  const lastMessage = chatSession.messages[chatSession.messages.length - 1];
  const pickerName = chatSession.messages.find(m => m.isFromPicker)?.senderName || 'Picker';

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        borderBottom: '1px solid #e0e0e0',
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
        '&:active': {
          backgroundColor: '#eeeeee',
        },
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 48,
          height: 48,
          fontSize: '1.2rem',
        }}
      >
        {pickerName.split(' ').map(n => n[0]).join('')}
      </Avatar>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Top row: Name and Timestamp */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: unread ? 600 : 400,
              fontSize: '1rem',
            }}
          >
            {pickerName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#666666',
              fontSize: '0.75rem',
              flexShrink: 0,
              ml: 1,
            }}
          >
            {getRelativeTime(lastMessage.timestamp)}
          </Typography>
        </Box>

        {/* Bottom row: Last message, Status dot, and Unread indicator */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#666666',
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: unread ? 500 : 400,
            }}
          >
            {truncateText(lastMessage.content, 50)}
          </Typography>

          {/* Status and Unread indicators */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 1 }}>
            {/* Status dot */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getStatusColor(chatSession.status),
              }}
            />

            {/* Unread indicator */}
            {unread && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#2196F3',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
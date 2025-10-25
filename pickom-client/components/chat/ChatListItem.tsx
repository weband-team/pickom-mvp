'use client';

import { Box, Typography, Avatar } from '@mui/material';
import { ChatSession } from '@/app/api/chat';

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
      return '#FF9500'; // Orange (Primary)
    case 'completed':
      return '#4CAF50'; // Green
    case 'cancelled':
      return '#9E9E9E'; // Grey
    default:
      return '#9E9E9E';
  }
};

const getRelativeTime = (timestamp: Date | string) => {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffInMs = now.getTime() - date.getTime();
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
  const lastMessage = chatSession.lastMessage;
  const pickerName = chatSession.pickerName || 'Picker';

  if (!lastMessage) {
    return null;
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        borderBottom: 1,
        borderColor: 'divider',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '&:active': {
          backgroundColor: 'action.selected',
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
            {getRelativeTime(lastMessage.createdAt)}
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
                  backgroundColor: 'primary.main',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
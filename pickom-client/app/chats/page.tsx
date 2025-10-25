'use client';

import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { PickomLogo } from '@/components/ui';
import { ChatListItem } from '@/components/chat/ChatListItem';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getMyChats, ChatSession } from '@/app/api/chat';
import { useState, useEffect, useMemo } from 'react';

export default function ChatsPage() {
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch chats from API
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getMyChats();
        setChatSessions(response.data);
      } catch (err: any) {
        console.error('Failed to fetch chats:', err);
        setError('Failed to load chats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Sort chat sessions by last update (most recent first)
  const sortedChatSessions = useMemo(() => {
    return [...chatSessions].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  }, [chatSessions]);

  // Calculate total unread count
  const unreadCount = useMemo(() => {
    return chatSessions.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  }, [chatSessions]);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleStartDelivery = () => {
    router.push('/delivery-methods');
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          p: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          p: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Empty state
  if (sortedChatSessions.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          p: 2,
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
          <MobileContainer showFrame={false}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 3,
                pb: 10,
                backgroundColor: 'background.default',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '4rem',
                    textAlign: 'center',
                    mb: 2,
                  }}
                >
                  💬
                </Typography>
                <PickomLogo variant="full" size="medium" />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  mb: 2,
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                No conversations yet
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: 320,
                  lineHeight: 1.6,
                }}
              >
                Start your first delivery to connect with reliable pickers and begin chatting in real-time
              </Typography>

              <Button
                variant="contained"
                onClick={handleStartDelivery}
                size="large"
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  px: 5,
                  py: 1.75,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(255, 149, 0, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(255, 149, 0, 0.4)',
                  },
                }}
              >
                🚀 Start a Delivery
              </Button>
            </Box>
          </MobileContainer>
          <BottomNavigation unreadChatsCount={0} />
        </Box>
      </Box>
    );
  }

  // List of chats
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
        <MobileContainer showFrame={false}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.5rem',
                }}
              >
                Chats
              </Typography>
              <PickomLogo variant="icon" size="medium" />
            </Box>

            {/* Chat list */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 8,
              }}
            >
              {sortedChatSessions.map((chatSession) => (
                <ChatListItem
                  key={chatSession.id}
                  chatSession={chatSession}
                  onClick={() => handleChatClick(chatSession.id)}
                  unread={(chatSession.unreadCount || 0) > 0}
                />
              ))}
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation unreadChatsCount={unreadCount} />
      </Box>
    </Box>
  );
}
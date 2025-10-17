'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, IconButton, CircularProgress, Alert } from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { PickomLogo } from '@/components/ui';
import { TextInput } from '@/components/ui';
import { ChatRoll, ChatMessage } from '@/components';
import { TabbedChat } from '@/components/chat/TabbedChat';
import { getChatById, sendMessage, markMessagesAsRead, getChatsByDeliveryId } from '@/app/api/chat';
import { ChatSession as ChatSessionType, Message } from '@/types/chat';
import { getCurrentUser } from '@/app/api/user';

interface ChatPageClientProps {
  chatId: string;
}

export function ChatPageClient({ chatId }: ChatPageClientProps) {
  const router = useRouter();
  const [chatSession, setChatSession] = useState<ChatSessionType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [senderChatId, setSenderChatId] = useState<string>('');
  const [receiverChatId, setReceiverChatId] = useState<string | undefined>();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getCurrentUser();
        setCurrentUserUid(response.user.uid);
        setCurrentUserRole(response.user.role);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch chat data
  useEffect(() => {
    const fetchChat = async () => {
      if (!currentUserRole) return;

      setLoading(true);
      setError('');

      try {
        const response = await getChatById(chatId);
        const chatData = response.data;
        setChatSession(chatData);

        // If picker and has delivery, fetch both chats
        if (currentUserRole === 'picker' && chatData.deliveryId) {
          const chatsResponse = await getChatsByDeliveryId(chatData.deliveryId);
          const allChats = chatsResponse.data;

          const senderChat = allChats.find(chat => chat.senderId !== null);
          const receiverChat = allChats.find(chat => chat.recipientId !== null);

          if (senderChat) setSenderChatId(senderChat.id);
          if (receiverChat) setReceiverChatId(receiverChat.id);
        }

        // Convert API messages to local format (for non-picker or single chat)
        if (chatData.messages && currentUserRole !== 'picker') {
          const formattedMessages: Message[] = chatData.messages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            isFromPicker: msg.senderId === chatData.pickerId,
            chatSessionId: msg.chatSessionId,
            attachments: msg.attachments,
            read: msg.read,
            createdAt: new Date(msg.createdAt),
          }));
          setMessages(formattedMessages);
        }

        // Mark messages as read (for non-picker)
        if (currentUserRole !== 'picker') {
          await markMessagesAsRead(chatId);
        }
      } catch (err: any) {
        console.error('Failed to fetch chat:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, currentUserRole]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const response = await sendMessage(chatId, {
        content: newMessage.trim(),
      });

      const sentMessage = response.data;

      // Add message to local state
      const formattedMessage: Message = {
        id: sentMessage.id,
        senderId: sentMessage.senderId,
        senderName: sentMessage.senderName,
        content: sentMessage.content,
        timestamp: new Date(sentMessage.createdAt),
        isFromPicker: sentMessage.senderId === chatSession?.pickerId,
        chatSessionId: sentMessage.chatSessionId,
        attachments: sentMessage.attachments,
        read: sentMessage.read,
        createdAt: new Date(sentMessage.createdAt),
      };

      setMessages(prev => [...prev, formattedMessage]);
      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, chatId, chatSession]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get participant name (the other person in chat)
  const getParticipantName = () => {
    if (!chatSession || !currentUserUid) return 'Chat';

    if (currentUserUid === chatSession.senderId) {
      return chatSession.pickerName || 'Picker';
    } else {
      return chatSession.senderName || 'Sender';
    }
  };

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
    isOwn: msg.senderId === currentUserUid,
  }));

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
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
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!chatSession) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Alert severity="warning">Chat not found</Alert>
      </Box>
    );
  }

  // Show TabbedChat for picker with delivery
  if (currentUserRole === 'picker' && chatSession?.deliveryId && senderChatId) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <MobileContainer showFrame={false}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton
                  onClick={() => router.push('/chats')}
                  size="small"
                  sx={{ p: 1 }}
                >
                  <ArrowBack />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Delivery Chat
                  </Typography>
                </Box>
                <PickomLogo variant="icon" size="small" />
              </Stack>
            </Box>

            <TabbedChat
              senderChatId={senderChatId}
              receiverChatId={receiverChatId}
              currentUserUid={currentUserUid}
            />
          </Box>
        </MobileContainer>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
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
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => router.push('/chats')}
                size="small"
                sx={{ p: 1 }}
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {getParticipantName()}
                </Typography>
              </Box>
              <PickomLogo variant="icon" size="small" />
            </Stack>
          </Box>

          {/* Chat Messages */}
          <Box sx={{ flex: 1, overflow: 'hidden', mx: 2 }}>
            <ChatRoll messages={chatMessages} height="100%" />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending}
                multiline
                maxRows={3}
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                <Send fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </MobileContainer>
    </Box>
  );
}

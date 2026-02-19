'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Tabs, Tab, Badge, Stack, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';
import { TextInput } from '../ui';
import { ChatRoll, ChatMessage } from '../index';
import { sendMessage, markMessagesAsRead, getChatById } from '@/app/api/chat';
import { ChatSession, Message } from '@/app/api/chat';

interface TabbedChatProps {
  senderChatId: string;
  receiverChatId?: string;
  currentUserUid: string;
}

type TabValue = 'sender' | 'receiver';

export function TabbedChat({ senderChatId, receiverChatId, currentUserUid }: TabbedChatProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('sender');
  const [senderChat, setSenderChat] = useState<ChatSession | null>(null);
  const [receiverChat, setReceiverChat] = useState<ChatSession | null>(null);
  const [senderMessages, setSenderMessages] = useState<Message[]>([]);
  const [receiverMessages, setReceiverMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [senderUnread, setSenderUnread] = useState(0);
  const [receiverUnread, setReceiverUnread] = useState(0);

  const fetchChatData = useCallback(async (chatId: string, isSenderChat: boolean) => {
    try {
      const response = await getChatById(chatId);
      const chatData = response.data;

      if (isSenderChat) {
        setSenderChat(chatData);
        if (chatData.messages) {
          const formatted = chatData.messages.map((msg: any) => ({
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
          setSenderMessages(formatted);
        }
        setSenderUnread(chatData.unreadCount || 0);
      } else {
        setReceiverChat(chatData);
        if (chatData.messages) {
          const formatted = chatData.messages.map((msg: any) => ({
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
          setReceiverMessages(formatted);
        }
        setReceiverUnread(chatData.unreadCount || 0);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchChatData(senderChatId, true);
    if (receiverChatId) {
      fetchChatData(receiverChatId, false);
    }
  }, [senderChatId, receiverChatId, fetchChatData]);

  useEffect(() => {
    const markRead = async () => {
      try {
        if (activeTab === 'sender') {
          await markMessagesAsRead(senderChatId);
          setSenderUnread(0);
        } else if (receiverChatId) {
          await markMessagesAsRead(receiverChatId);
          setReceiverUnread(0);
        }
      } catch {
      }
    };

    markRead();
  }, [activeTab, senderChatId, receiverChatId]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending) return;

    const activeChatId = activeTab === 'sender' ? senderChatId : receiverChatId;
    if (!activeChatId) return;

    const activeChat = activeTab === 'sender' ? senderChat : receiverChat;
    if (!activeChat) return;

    setSending(true);

    try {
      const response = await sendMessage(activeChatId, {
        content: newMessage.trim(),
      });

      const sentMessage = response.data;
      const formattedMessage: Message = {
        id: sentMessage.id,
        senderId: sentMessage.senderId,
        senderName: sentMessage.senderName,
        content: sentMessage.content,
        timestamp: new Date(sentMessage.createdAt),
        isFromPicker: sentMessage.senderId === activeChat.pickerId,
        chatSessionId: sentMessage.chatSessionId,
        attachments: sentMessage.attachments,
        read: sentMessage.read,
        createdAt: new Date(sentMessage.createdAt),
      };

      if (activeTab === 'sender') {
        setSenderMessages(prev => [...prev, formattedMessage]);
      } else {
        setReceiverMessages(prev => [...prev, formattedMessage]);
      }

      setNewMessage('');
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, activeTab, senderChatId, receiverChatId, senderChat, receiverChat]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const convertToChatMessages = (messages: Message[], pickerId: string): ChatMessage[] => {
    return messages.map(msg => ({
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
  };

  const activeMessages = activeTab === 'sender' ? senderMessages : receiverMessages;
  const activeChat = activeTab === 'sender' ? senderChat : receiverChat;
  const activeChatMessages = activeChat
    ? convertToChatMessages(activeMessages, activeChat.pickerId)
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab
            label={
              <Badge badgeContent={senderUnread} color="error">
                Sender
              </Badge>
            }
            value="sender"
          />
          {receiverChatId && (
            <Tab
              label={
                <Badge badgeContent={receiverUnread} color="error">
                  Receiver
                </Badge>
              }
              value="receiver"
            />
          )}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', mx: 2 }}>
        <ChatRoll messages={activeChatMessages} height="100%" />
      </Box>

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
  );
}

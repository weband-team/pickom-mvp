import { AxiosResponse } from 'axios';
import { protectedFetch } from './base';

export interface Message {
  id: string;
  chatSessionId: string;
  senderId: string; // Firebase UID
  senderName: string;
  content: string;
  attachments?: string[];
  read: boolean;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  deliveryId?: number;
  senderId: string | null;
  senderName: string | null;
  pickerId: string;
  pickerName: string;
  recipientId?: string | null;
  recipientName?: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface CreateChatRequest {
  participantId: string; // Firebase UID of other participant
  deliveryId?: number;
}

export interface CreateChatResponse {
  chatId: string;
  createdAt: Date;
}

export interface SendMessageRequest {
  content: string;
  attachments?: string[];
}

/**
 * Create a new chat session or get existing one
 */
export const createChat = async (
  data: CreateChatRequest
): Promise<AxiosResponse<CreateChatResponse>> => {
  return protectedFetch.post('/chat/create', data);
};

/**
 * Get all my chats
 */
export const getMyChats = async (): Promise<AxiosResponse<ChatSession[]>> => {
  return protectedFetch.get('/chat');
};

/**
 * Get chats by delivery ID
 */
export const getChatsByDeliveryId = async (deliveryId: number): Promise<AxiosResponse<ChatSession[]>> => {
  return protectedFetch.get(`/chat/delivery/${deliveryId}`);
};

/**
 * Get chat by ID with all messages
 */
export const getChatById = async (chatId: string): Promise<AxiosResponse<ChatSession>> => {
  return protectedFetch.get(`/chat/${chatId}`);
};

/**
 * Send a message in a chat
 */
export const sendMessage = async (
  chatId: string,
  data: SendMessageRequest
): Promise<AxiosResponse<Message>> => {
  return protectedFetch.post(`/chat/${chatId}/messages`, data);
};

/**
 * Get messages for a chat
 */
export const getChatMessages = async (
  chatId: string,
  limit = 50,
  offset = 0
): Promise<AxiosResponse<Message[]>> => {
  return protectedFetch.get(`/chat/${chatId}/messages`, {
    params: { limit, offset },
  });
};

/**
 * Mark all messages in chat as read
 */
export const markMessagesAsRead = async (chatId: string): Promise<AxiosResponse<void>> => {
  return protectedFetch.patch(`/chat/${chatId}/messages/mark-read`);
};

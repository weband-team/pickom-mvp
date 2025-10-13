import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatSessionDto, MessageDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Create a new chat session or return existing one
   */
  async createChat(
    currentUserUid: string,
    createChatDto: CreateChatDto,
  ): Promise<{ chatId: string; createdAt: Date }> {
    const { participantId, deliveryId } = createChatDto;

    // Get current user and participant from database
    const currentUser = await this.userService.findOne(currentUserUid);
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    const participant = await this.userService.findOne(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Determine who is sender and who is picker
    let senderId: number;
    let pickerId: number;

    if (currentUser.role === 'sender' && participant.role === 'picker') {
      senderId = currentUser.id;
      pickerId = participant.id;
    } else if (currentUser.role === 'picker' && participant.role === 'sender') {
      senderId = participant.id;
      pickerId = currentUser.id;
    } else {
      throw new BadRequestException(
        'Chat can only be created between sender and picker',
      );
    }

    // Check if chat already exists
    let existingChat: ChatSession | null;
    if (deliveryId) {
      existingChat = await this.chatSessionRepository.findOne({
        where: {
          senderId,
          pickerId,
          deliveryId,
        },
      });
    } else {
      existingChat = await this.chatSessionRepository.findOne({
        where: {
          senderId,
          pickerId,
          deliveryId: null as any,
        },
      });
    }

    if (existingChat) {
      return {
        chatId: existingChat.id,
        createdAt: existingChat.createdAt,
      };
    }

    // Create new chat session
    const chatSession = this.chatSessionRepository.create({
      senderId,
      pickerId,
      deliveryId: deliveryId ? deliveryId : null,
    });

    const savedChat = await this.chatSessionRepository.save(chatSession);

    return {
      chatId: savedChat.id,
      createdAt: savedChat.createdAt,
    };
  }

  /**
   * Get all chats for current user
   */
  async getMyChats(currentUserUid: string): Promise<ChatSessionDto[]> {
    const currentUser = await this.userService.findOne(currentUserUid);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const chats = await this.chatSessionRepository.find({
      where: [{ senderId: currentUser.id }, { pickerId: currentUser.id }],
      relations: [
        'sender',
        'picker',
        'messages',
        'messages.sender',
        'delivery',
      ],
      order: { updatedAt: 'DESC' },
    });

    return Promise.all(
      chats.map((chat) => this.transformChatSession(chat, currentUser.id)),
    );
  }

  /**
   * Get chat by ID
   */
  async getChatById(
    chatId: string,
    currentUserUid: string,
  ): Promise<ChatSessionDto> {
    const currentUser = await this.userService.findOne(currentUserUid);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const chat = await this.chatSessionRepository.findOne({
      where: { id: chatId },
      relations: [
        'sender',
        'picker',
        'messages',
        'messages.sender',
        'delivery',
      ],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is participant
    if (chat.senderId !== currentUser.id && chat.pickerId !== currentUser.id) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    return this.transformChatSession(chat, currentUser.id, true);
  }

  /**
   * Send a message
   */
  async sendMessage(
    chatId: string,
    currentUserUid: string,
    sendMessageDto: SendMessageDto,
  ): Promise<MessageDto> {
    const currentUser = await this.userService.findOne(currentUserUid);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const chat = await this.chatSessionRepository.findOne({
      where: { id: chatId },
      relations: ['sender', 'picker'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is participant
    if (chat.senderId !== currentUser.id && chat.pickerId !== currentUser.id) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    // Create message
    const message = this.messageRepository.create({
      chatSessionId: chatId,
      senderId: currentUser.id,
      content: sendMessageDto.content,
      attachments: sendMessageDto.attachments || [],
    });

    const savedMessage = await this.messageRepository.save(message);

    // Reload message with sender relation to ensure correct data
    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    if (!messageWithSender) {
      throw new Error('Message not found after creation');
    }

    // Update chat session updatedAt
    chat.updatedAt = new Date();
    await this.chatSessionRepository.save(chat);

    // Send notification to other participant
    const recipientId =
      chat.senderId === currentUser.id ? chat.pickerId : chat.senderId;
    const recipient =
      chat.senderId === currentUser.id ? chat.picker : chat.sender;

    await this.notificationService.createNotification({
      user_id: recipient.uid,
      type: 'new_message',
      title: 'New message',
      message: `${currentUser.name} sent you a message`,
      read: false,
    });

    return this.transformMessage(messageWithSender, messageWithSender.sender);
  }

  /**
   * Get messages for a chat
   */
  async getMessages(
    chatId: string,
    currentUserUid: string,
    limit = 50,
    offset = 0,
  ): Promise<MessageDto[]> {
    const currentUser = await this.userService.findOne(currentUserUid);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const chat = await this.chatSessionRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is participant
    if (chat.senderId !== currentUser.id && chat.pickerId !== currentUser.id) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const messages = await this.messageRepository.find({
      where: { chatSessionId: chatId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return messages.map((msg) => this.transformMessage(msg, msg.sender));
  }

  /**
   * Mark all messages in chat as read
   */
  async markMessagesAsRead(
    chatId: string,
    currentUserUid: string,
  ): Promise<void> {
    const currentUser = await this.userService.findOne(currentUserUid);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const chat = await this.chatSessionRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is participant
    if (chat.senderId !== currentUser.id && chat.pickerId !== currentUser.id) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    // Mark all messages not sent by current user as read
    await this.messageRepository.update(
      {
        chatSessionId: chatId,
        senderId:
          currentUser.id !== chat.senderId ? chat.senderId : chat.pickerId,
        read: false,
      },
      { read: true },
    );
  }

  /**
   * Transform ChatSession entity to DTO
   */
  private async transformChatSession(
    chat: ChatSession,
    currentUserId: number,
    includeAllMessages = false,
  ): Promise<ChatSessionDto> {
    const messages = includeAllMessages
      ? chat.messages?.map((msg) => this.transformMessage(msg, msg.sender))
      : undefined;

    const lastMessage = chat.messages?.length
      ? this.transformMessage(
          chat.messages[chat.messages.length - 1],
          chat.messages[chat.messages.length - 1].sender,
        )
      : undefined;

    // Count unread messages
    const unreadCount =
      chat.messages?.filter(
        (msg) => msg.senderId !== currentUserId && !msg.read,
      ).length || 0;

    return {
      id: chat.id,
      deliveryId: chat.deliveryId || undefined,
      senderId: chat.sender.uid,
      senderName: chat.sender.name,
      pickerId: chat.picker.uid,
      pickerName: chat.picker.name,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages,
      lastMessage,
      unreadCount,
    };
  }

  /**
   * Transform Message entity to DTO
   */
  private transformMessage(message: Message, sender: any): MessageDto {
    return {
      id: message.id,
      chatSessionId: message.chatSessionId,
      senderId: sender.uid,
      senderName: sender.name,
      content: message.content,
      attachments: message.attachments,
      read: message.read,
      createdAt: message.createdAt,
    };
  }
}

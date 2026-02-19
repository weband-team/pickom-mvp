import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { DeliveryService } from '../delivery/delivery.service';
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
    @Inject(forwardRef(() => DeliveryService))
    private readonly deliveryService: DeliveryService,
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

    let senderId: number | null = null;
    let pickerId: number | null = null;
    let recipientId: number | null = null;

    // If deliveryId is provided, check if either user is the recipient
    let delivery: any = null;
    if (deliveryId) {
      delivery = await this.deliveryService.getDeliveryRequestById(
        deliveryId,
        currentUser.uid,
        currentUser.role,
      );
    }

    // Determine roles based on actual delivery data, not just user.role
    const isCurrentUserRecipient = delivery?.recipientId === currentUser.id;
    const isParticipantRecipient = delivery?.recipientId === participant.id;
    const isCurrentUserPicker = currentUser.role === 'picker';
    const isParticipantPicker = participant.role === 'picker';

    if (isCurrentUserPicker && !isParticipantPicker) {
      // Current user is picker
      pickerId = currentUser.id;
      if (isParticipantRecipient) {
        recipientId = participant.id;
      } else {
        senderId = participant.id;
      }
    } else if (isParticipantPicker && !isCurrentUserPicker) {
      // Participant is picker
      pickerId = participant.id;
      if (isCurrentUserRecipient) {
        recipientId = currentUser.id;
      } else {
        senderId = currentUser.id;
      }
    } else {
      throw new BadRequestException(
        'Chat can only be created between picker and sender/recipient',
      );
    }

    if (!pickerId) {
      throw new BadRequestException('Picker must be part of the chat');
    }

    let existingChat: ChatSession | null;

    const whereClause: any = {
      pickerId,
      deliveryId: deliveryId || null,
    };

    if (senderId) {
      whereClause.senderId = senderId;
      whereClause.recipientId = null;
    } else if (recipientId) {
      whereClause.recipientId = recipientId;
      whereClause.senderId = null;
    }

    existingChat = await this.chatSessionRepository.findOne({
      where: whereClause,
    });

    if (existingChat) {
      console.log('[ChatService] Found existing chat:', existingChat.id);
      return {
        chatId: existingChat.id,
        createdAt: existingChat.createdAt,
      };
    }

    console.log('[ChatService] Creating new chat:', {
      senderId,
      pickerId,
      recipientId,
      deliveryId,
    });

    const chatSession = this.chatSessionRepository.create({
      senderId,
      pickerId,
      recipientId,
      deliveryId: deliveryId || null,
    });

    const savedChat = await this.chatSessionRepository.save(chatSession);

    console.log('[ChatService] Created new chat:', savedChat.id);

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
      where: [
        { senderId: currentUser.id },
        { pickerId: currentUser.id },
        { recipientId: currentUser.id },
      ],
      relations: [
        'sender',
        'picker',
        'recipient',
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
   * Get chats by delivery ID
   */
  async getChatsByDeliveryId(
    deliveryId: number,
    currentUserUid: string,
  ): Promise<ChatSessionDto[]> {
    const currentUser = await this.userService.findOne(currentUserUid);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const chats = await this.chatSessionRepository.find({
      where: { deliveryId },
      relations: [
        'sender',
        'picker',
        'recipient',
        'messages',
        'messages.sender',
        'delivery',
      ],
      order: { updatedAt: 'DESC' },
    });

    const participatingChats = chats.filter(
      (chat) =>
        chat.senderId === currentUser.id ||
        chat.pickerId === currentUser.id ||
        chat.recipientId === currentUser.id,
    );

    return Promise.all(
      participatingChats.map((chat) =>
        this.transformChatSession(chat, currentUser.id, true),
      ),
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
        'recipient',
        'messages',
        'messages.sender',
        'delivery',
      ],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant =
      chat.senderId === currentUser.id ||
      chat.pickerId === currentUser.id ||
      chat.recipientId === currentUser.id;

    if (!isParticipant) {
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
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant =
      chat.senderId === currentUser.id ||
      chat.pickerId === currentUser.id ||
      chat.recipientId === currentUser.id;

    if (!isParticipant) {
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

    let recipientUser;
    if (chat.senderId && chat.senderId === currentUser.id) {
      recipientUser = chat.picker;
    } else if (chat.pickerId === currentUser.id) {
      if (chat.senderId) {
        recipientUser = chat.sender;
      } else if (chat.recipientId) {
        recipientUser = chat.recipient;
      }
    } else if (chat.recipientId === currentUser.id) {
      recipientUser = chat.picker;
    }

    if (recipientUser) {
      await this.notificationService.createNotification({
        user_id: recipientUser.uid,
        type: 'new_message',
        title: 'New message',
        message: `${currentUser.name} sent you a message`,
        read: false,
      });
    }

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

    const isParticipant =
      chat.senderId === currentUser.id ||
      chat.pickerId === currentUser.id ||
      chat.recipientId === currentUser.id;

    if (!isParticipant) {
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

    const isParticipant =
      chat.senderId === currentUser.id ||
      chat.pickerId === currentUser.id ||
      chat.recipientId === currentUser.id;

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ read: true })
      .where('chatSessionId = :chatId', { chatId })
      .andWhere('senderId != :userId', { userId: currentUser.id })
      .andWhere('read = :read', { read: false })
      .execute();
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
      senderId: chat.sender?.uid || null,
      senderName: chat.sender?.name || null,
      pickerId: chat.picker.uid,
      pickerName: chat.picker.name,
      recipientId: chat.recipient?.uid || null,
      recipientName: chat.recipient?.name || null,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages,
      lastMessage,
      unreadCount,
    };
  }

  /**
   * Get unified chat sessions for picker (both sender and receiver chats)
   */
  async getUnifiedSessionsForPicker(
    deliveryId: number,
    pickerUid: string,
  ): Promise<{
    senderChat: ChatSessionDto | null;
    receiverChat: ChatSessionDto | null;
  }> {
    const picker = await this.userService.findOne(pickerUid);
    if (!picker) {
      throw new NotFoundException('Picker not found');
    }

    if (picker.role !== 'picker') {
      throw new ForbiddenException('User is not a picker');
    }

    // Find both chat sessions for this delivery
    const chats = await this.chatSessionRepository.find({
      where: {
        deliveryId,
        pickerId: picker.id,
      },
      relations: [
        'sender',
        'picker',
        'recipient',
        'messages',
        'messages.sender',
        'delivery',
      ],
      order: { updatedAt: 'DESC' },
    });

    // Separate sender and receiver chats
    let senderChat: ChatSessionDto | null = null;
    let receiverChat: ChatSessionDto | null = null;

    for (const chat of chats) {
      if (chat.senderId !== null && chat.recipientId === null) {
        // This is the sender chat
        senderChat = await this.transformChatSession(chat, picker.id, true);
      } else if (chat.senderId === null && chat.recipientId !== null) {
        // This is the receiver chat
        receiverChat = await this.transformChatSession(chat, picker.id, true);
      }
    }

    return {
      senderChat,
      receiverChat,
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

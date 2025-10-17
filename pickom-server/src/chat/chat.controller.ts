import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatSessionDto, MessageDto } from './dto/chat-response.dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new chat session or return existing one' })
  @ApiResponse({
    status: 201,
    description: 'Chat created or found',
    schema: {
      properties: {
        chatId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async createChat(
    @Req() req: any,
    @Body() createChatDto: CreateChatDto,
  ): Promise<{ chatId: string; createdAt: Date }> {
    return this.chatService.createChat(req.user.uid, createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all my chats' })
  @ApiResponse({
    status: 200,
    description: 'List of chat sessions',
    type: [ChatSessionDto],
  })
  async getMyChats(@Req() req: any): Promise<ChatSessionDto[]> {
    return this.chatService.getMyChats(req.user.uid);
  }

  @Get('delivery/:deliveryId')
  @ApiOperation({ summary: 'Get chats by delivery ID' })
  @ApiResponse({
    status: 200,
    description: 'List of chat sessions for delivery',
    type: [ChatSessionDto],
  })
  async getChatsByDeliveryId(
    @Req() req: any,
    @Param('deliveryId') deliveryId: string,
  ): Promise<ChatSessionDto[]> {
    return this.chatService.getChatsByDeliveryId(parseInt(deliveryId), req.user.uid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat by ID with all messages' })
  @ApiResponse({
    status: 200,
    description: 'Chat session details',
    type: ChatSessionDto,
  })
  async getChatById(
    @Req() req: any,
    @Param('id') chatId: string,
  ): Promise<ChatSessionDto> {
    return this.chatService.getChatById(chatId, req.user.uid);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a chat' })
  @ApiResponse({
    status: 201,
    description: 'Message sent',
    type: MessageDto,
  })
  async sendMessage(
    @Req() req: any,
    @Param('id') chatId: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<MessageDto> {
    return this.chatService.sendMessage(chatId, req.user.uid, sendMessageDto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages for a chat' })
  @ApiResponse({
    status: 200,
    description: 'List of messages',
    type: [MessageDto],
  })
  async getMessages(
    @Req() req: any,
    @Param('id') chatId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<MessageDto[]> {
    return this.chatService.getMessages(
      chatId,
      req.user.uid,
      limit || 50,
      offset || 0,
    );
  }

  @Patch(':id/messages/mark-read')
  @ApiOperation({ summary: 'Mark all messages in chat as read' })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read',
  })
  async markMessagesAsRead(
    @Req() req: any,
    @Param('id') chatId: string,
  ): Promise<void> {
    return this.chatService.markMessagesAsRead(chatId, req.user.uid);
  }
}

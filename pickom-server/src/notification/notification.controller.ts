import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { NotificationDto } from './dto/notification.dto';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Request() req): Promise<NotificationDto[]> {
    const userId = req.user.uid; // Get user UID from Firebase token
    return await this.notificationService.getUserNotifications(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const userId = req.user.uid;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<NotificationDto | null> {
    return await this.notificationService.markAsRead(parseInt(id));
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req): Promise<{ success: boolean }> {
    const userId = req.user.uid;
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  // Create notification about new offer
  @Post('offer-received')
  async notifyOfferReceived(
    @Body()
    body: {
      senderId: string;
      deliveryId: number;
      pickerName: string;
      price: number;
    },
  ): Promise<NotificationDto> {
    return await this.notificationService.notifyOfferReceived(
      body.senderId,
      body.deliveryId,
      body.pickerName,
      body.price,
    );
  }

  // Create notification about offer acceptance
  @Post('offer-accepted')
  async notifyOfferAccepted(
    @Body() body: { senderId: string; deliveryId: number },
  ): Promise<NotificationDto> {
    return await this.notificationService.notifyOfferAccepted(
      body.senderId,
      body.deliveryId,
    );
  }

  // Create notification about incoming delivery
  @Post('incoming-delivery')
  async notifyIncomingDelivery(
    @Body()
    body: {
      recipientId: string;
      deliveryId: number;
      senderName: string;
    },
  ): Promise<NotificationDto> {
    return await this.notificationService.notifyIncomingDelivery(
      body.recipientId,
      body.deliveryId,
      body.senderName,
    );
  }

  // Create notification about status update
  @Post('status-update')
  async notifyStatusUpdate(
    @Body()
    body: {
      userId: string;
      deliveryId: number;
      status: string;
      message: string;
    },
  ): Promise<NotificationDto> {
    return await this.notificationService.notifyStatusUpdate(
      body.userId,
      body.deliveryId,
      body.status,
      body.message,
    );
  }

  // General method to create custom notification
  @Post('create')
  async createNotification(
    @Body() notificationData: Omit<NotificationDto, 'id' | 'created_at'>,
  ): Promise<NotificationDto> {
    return await this.notificationService.createNotification(notificationData);
  }
}

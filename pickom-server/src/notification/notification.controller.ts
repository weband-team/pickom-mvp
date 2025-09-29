import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Request() req): Promise<Notification[]> {
    const userId = req.user.uid; // Получаем UID пользователя из Firebase token
    return await this.notificationService.getUserNotifications(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const userId = req.user.uid;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Notification | null> {
    return await this.notificationService.markAsRead(parseInt(id));
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req): Promise<{ success: boolean }> {
    const userId = req.user.uid;
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }
}
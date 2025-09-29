import { Injectable } from '@nestjs/common';
import { NotificationDto } from './dto/notification.dto';
import { MOCK_NOTIFICATIONS } from 'src/mocks/notification.mock';

@Injectable()
export class NotificationService {
  private notifications: NotificationDto[] = [...MOCK_NOTIFICATIONS];

  async createNotification(
    notificationData: Omit<NotificationDto, 'id' | 'created_at'>,
  ): Promise<NotificationDto> {
    const newNotification: NotificationDto = {
      ...notificationData,
      id: this.notifications.length + 1,
      created_at: new Date(),
    };

    this.notifications.push(newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<NotificationDto[]> {
    return this.notifications
      .filter((notification) => notification.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifications.filter(
      (notification) => notification.user_id === userId && !notification.read,
    ).length;
  }

  async markAsRead(notificationId: number): Promise<NotificationDto | null> {
    const notificationIndex = this.notifications.findIndex(
      (n) => n.id === notificationId,
    );

    if (notificationIndex === -1) {
      return null;
    }

    this.notifications[notificationIndex].read = true;
    return this.notifications[notificationIndex];
  }

  async markAllAsRead(userId: string): Promise<void> {
    this.notifications.forEach((notification) => {
      if (notification.user_id === userId) {
        notification.read = true;
      }
    });
  }

  // Метод для создания уведомления о новом предложении
  async notifyOfferReceived(
    senderId: string,
    deliveryId: number,
    pickerName: string,
    price: number,
  ): Promise<NotificationDto> {
    return await this.createNotification({
      user_id: senderId,
      title: 'Новое предложение',
      message: `Курьер ${pickerName} предложил доставить вашу посылку за ${price} BYN`,
      type: 'offer_received',
      read: false,
      related_delivery_id: deliveryId,
    });
  }

  // Метод для создания уведомления о принятии предложения
  async notifyOfferAccepted(
    senderId: string,
    deliveryId: number,
  ): Promise<NotificationDto> {
    return await this.createNotification({
      user_id: senderId,
      title: 'Предложение принято',
      message: 'Ваше предложение принято. Курьер забирает посылку.',
      type: 'offer_accepted',
      read: false,
      related_delivery_id: deliveryId,
    });
  }

  // Метод для создания уведомления о входящей доставке
  async notifyIncomingDelivery(
    recipientId: string,
    deliveryId: number,
    senderName: string,
  ): Promise<NotificationDto> {
    return await this.createNotification({
      user_id: recipientId,
      title: 'Вам отправили посылку',
      message: `${senderName} отправил вам посылку. Курьер уже в пути.`,
      type: 'incoming_delivery',
      read: false,
      related_delivery_id: deliveryId,
    });
  }

  // Метод для создания уведомления об изменении статуса
  async notifyStatusUpdate(
    userId: string,
    deliveryId: number,
    status: string,
    message: string,
  ): Promise<NotificationDto> {
    const statusTitles: Record<string, string> = {
      picked_up: 'Посылка забрана',
      delivered: 'Посылка доставлена',
      cancelled: 'Доставка отменена',
    };

    return await this.createNotification({
      user_id: userId,
      title: statusTitles[status] || 'Обновление статуса',
      message,
      type: 'status_update',
      read: false,
      related_delivery_id: deliveryId,
    });
  }
}

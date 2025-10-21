import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationDto } from './dto/notification.dto';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createNotification(
    notificationData: Omit<NotificationDto, 'id' | 'created_at'>,
  ): Promise<NotificationDto> {
    const user = await this.userRepository.findOne({
      where: { uid: notificationData.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `User with uid ${notificationData.user_id} not found`,
      );
    }

    const notification = this.notificationRepository.create({
      userId: user.id,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      read: notificationData.read ?? false,
      relatedDeliveryId: notificationData.related_delivery_id,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    return this.mapToDto(savedNotification, user.uid);
  }

  async getUserNotifications(userId: string): Promise<NotificationDto[]> {
    const user = await this.userRepository.findOne({
      where: { uid: userId },
    });

    if (!user) {
      return [];
    }

    const notifications = await this.notificationRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return notifications.map((n) => this.mapToDto(n, user.uid));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { uid: userId },
    });

    if (!user) {
      return 0;
    }

    return await this.notificationRepository.count({
      where: {
        userId: user.id,
        read: false,
      },
    });
  }

  async markAsRead(notificationId: number): Promise<NotificationDto | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });

    if (!notification) {
      return null;
    }

    notification.read = true;
    const updated = await this.notificationRepository.save(notification);

    return this.mapToDto(updated, notification.user.uid);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uid: userId },
    });

    if (!user) {
      return;
    }

    await this.notificationRepository.update(
      { userId: user.id, read: false },
      { read: true },
    );
  }

  private mapToDto(
    notification: Notification,
    userUid: string,
  ): NotificationDto {
    return {
      id: notification.id,
      user_id: userUid,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      created_at: notification.createdAt,
      related_delivery_id: notification.relatedDeliveryId,
    };
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
      message: `${senderName} хочет отправить вам посылку. Пожалуйста, подтвердите получение.`,
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

  // Notify receiver when delivery is picked up
  async notifyReceiverPickedUp(
    recipientUid: string,
    deliveryId: number,
    pickerName: string,
  ): Promise<NotificationDto> {
    return await this.createNotification({
      user_id: recipientUid,
      title: 'Your delivery has been picked up',
      message: `${pickerName} has picked up your delivery. Please confirm receipt when delivered.`,
      type: 'delivery_picked_up',
      read: false,
      related_delivery_id: deliveryId,
    });
  }

  // Notify picker when receiver confirms delivery
  async notifyPickerConfirmed(
    pickerUid: string,
    deliveryId: number,
    receiverName: string,
  ): Promise<NotificationDto> {
    return await this.createNotification({
      user_id: pickerUid,
      title: 'Delivery Confirmed',
      message: `${receiverName} has confirmed receipt of the delivery.`,
      type: 'delivery_confirmed',
      read: false,
      related_delivery_id: deliveryId,
    });
  }
}

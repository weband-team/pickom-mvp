import { Injectable } from '@nestjs/common';
import { MOCK_DELIVERY_REQUESTS } from 'src/mocks/delivery-requests.mock';
import { MOCK_USERS } from 'src/mocks/users.mock';
import { Delivery } from './entities/delivery.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/types/user.type';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class DeliveryService {
  private deliveryRequests = [...MOCK_DELIVERY_REQUESTS];
  private users = MOCK_USERS;

  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ){

  }

  // Получить всех курьеров (role: 'picker')
  async getAvailablePickers(): Promise<User[]> {
    return await this.userService.findAllPickers();
  }

  // Создать запрос на доставку
  async createDeliveryRequest(
    senderId: string,
    pickerId: string,
    from: string,
    to: string,
    price: number,
    recipientId?: string,
  ): Promise<Delivery> {
    const newRequest: Delivery = {
      id: this.deliveryRequests.length + 1,
      senderId,
      pickerId,
      recipientId,
      status: 'pending',
      from,
      to,
      price,
      createdAt: new Date(),
    };

    this.deliveryRequests.push(newRequest);

    // Если указан получатель, создаем уведомление о входящей доставке
    if (recipientId) {
      const sender = this.users.find(u => u.uid === senderId);
      if (sender) {
        await this.notificationService.notifyIncomingDelivery(
          recipientId,
          newRequest.id,
          sender.name
        );
      }
    }

    return newRequest;
  }

  // Получить список всех запросов
  async getAllDeliveryRequests(uid: string, role: string): Promise<Delivery[]> {
    return this.deliveryRequests.filter((request) => role === 'sender' ? request.senderId === uid : request.pickerId === uid);
  }

  // Получить запрос по ID
  async getDeliveryRequestById(id: number, uid: string, role: string): Promise<Delivery | null> {
    const delivery = this.deliveryRequests.find(request => request.id === id) || null;
    if (!delivery) {
      return null;
    }
    if (role === 'sender' && delivery.senderId !== uid) {
      return null;
    }
    if (role === 'picker' && delivery.pickerId !== uid) {
      return null;
    }
    return delivery;
  }

  // Обновить статус запроса
  async updateDeliveryRequestStatus(
    id: number,
    status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
    uid: string,
  ): Promise<Delivery | null> {
    const requestIndex = this.deliveryRequests.findIndex(request => request.id === id);

    if (requestIndex === -1) {
      return null;
    }

    if (this.deliveryRequests[requestIndex].pickerId !== uid) {
      return null;
    }

    const delivery = this.deliveryRequests[requestIndex];
    this.deliveryRequests[requestIndex].status = status;

    // Создаем уведомления при изменении статуса
    const statusMessages: Record<string, string> = {
      'picked_up': 'Курьер забрал вашу посылку и направляется к получателю.',
      'delivered': 'Ваша посылка успешно доставлена!',
      'cancelled': 'Доставка была отменена.'
    };

    const message = statusMessages[status];
    if (message) {
      // Уведомление для отправителя
      await this.notificationService.notifyStatusUpdate(
        delivery.senderId,
        id,
        status,
        message
      );

      // Уведомление для получателя (если указан)
      if (delivery.recipientId) {
        const recipientMessages: Record<string, string> = {
          'picked_up': 'Курьер забрал посылку и направляется к вам.',
          'delivered': 'Посылка доставлена к вам!',
          'cancelled': 'Доставка посылки была отменена.'
        };

        const recipientMessage = recipientMessages[status];
        if (recipientMessage) {
          await this.notificationService.notifyStatusUpdate(
            delivery.recipientId,
            id,
            status,
            recipientMessage
          );
        }
      }
    }

    return this.deliveryRequests[requestIndex];
  }
}

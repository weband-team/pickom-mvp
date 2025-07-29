import { Injectable } from '@nestjs/common';
import { MOCK_DELIVERY_REQUESTS } from 'src/mocks/delivery-requests.mock';
import { MOCK_USERS } from 'src/mocks/users.mock';
import { Delivery } from './entities/delivery.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/types/user.type';

@Injectable()
export class DeliveryService {
  private deliveryRequests = MOCK_DELIVERY_REQUESTS;
  private users = MOCK_USERS;

  constructor(
    private readonly userService: UserService,
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
  ): Promise<Delivery> {
    const newRequest: Delivery = {
      id: this.deliveryRequests.length + 1,
      senderId,
      pickerId,
      status: 'pending',
      from,
      to,
      price,
      createdAt: new Date(),
    };

    this.deliveryRequests.push(newRequest);
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
    status: 'accepted' | 'declined',
    uid: string,
  ): Promise<Delivery | null> {
    const requestIndex = this.deliveryRequests.findIndex(request => request.id === id);

    if (requestIndex === -1) {
      return null;
    }

    if (this.deliveryRequests[requestIndex].pickerId !== uid) {
      return null;
    }

    this.deliveryRequests[requestIndex].status = status;
    return this.deliveryRequests[requestIndex];
  }
}

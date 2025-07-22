import { Injectable } from '@nestjs/common';
import { MOCK_DELIVERY_REQUESTS } from 'src/mocks/delivery-requests.mock';
import { MOCK_USERS } from 'src/mocks/users.mock';

@Injectable()
export class DeliveryService {
  private deliveryRequests = MOCK_DELIVERY_REQUESTS;
  private users = MOCK_USERS;

  // Получить всех курьеров (role: 'picker')
  getAvailablePickers() {
    return this.users.filter((user) => user.role === 'picker');
  }

  // Создать запрос на доставку (отправитель → курьеру)
  createDeliveryRequest(senderId: string, pickerId: string, from: string, to: string) {
    const newRequest = {
      id: Date.now().toString(),
      senderId,
      pickerId,
      status: 'pending',
      from,
      to,
      createdAt: new Date(),
    };
    this.deliveryRequests.push(newRequest);
    return newRequest;
  }

  // Получить список всех запросов
  getAllDeliveryRequests() {
    return this.deliveryRequests;
  }

  // Получить детали запроса по ID
  getDeliveryRequestById(id: string) {
    return this.deliveryRequests.find((req) => req.id === id);
  }

  // Курьер принимает/отклоняет запрос
  updateDeliveryRequestStatus(id: string, pickerId: string, status: 'accepted' | 'declined') {
    const request = this.deliveryRequests.find((req) => req.id === id);
    if (!request) throw new Error('Request not found');
    if (request.pickerId && request.pickerId !== pickerId) {
      throw new Error('This request is assigned to another picker');
    }
    request.pickerId = pickerId;
    request.status = status;
    return request;
  }
}

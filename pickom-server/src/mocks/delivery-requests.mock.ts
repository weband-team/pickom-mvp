import { DeliveryDto } from 'src/delivery/dto/delivery.dto';

export const MOCK_DELIVERY_REQUESTS: DeliveryDto[] = [
  {
    id: 1,
    senderId: '1',
    pickerId: '2',
    recipientId: '3', // Получатель посылки
    status: 'accepted',
    from: 'Минск',
    to: 'Гродно',
    price: 100,
    createdAt: new Date(),
  },
];

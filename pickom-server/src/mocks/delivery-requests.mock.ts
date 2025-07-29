import { Delivery } from "src/delivery/entities/delivery.entity";

export const MOCK_DELIVERY_REQUESTS: Delivery[] = [
  {
    id: 1,
    senderId: '1',
    pickerId: '2',
    status: 'accepted',
    from: 'Минск',
    to: 'Гродно',
    price: 100,
    createdAt: new Date(),
  },
];
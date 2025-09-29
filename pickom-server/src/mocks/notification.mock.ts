import { Notification } from 'src/notification/entities/notification.entity';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 'm9VpYOgStCgV6b3JaI4ZhwZO5Wy2',
    title: 'Новое предложение',
    message: 'Курьер предложил доставить вашу посылку за 50 BYN',
    type: 'offer_received',
    read: false,
    created_at: new Date('2024-01-15T10:00:00'),
    related_delivery_id: 1
  },
  {
    id: 2,
    user_id: 'm9VpYOgStCgV6b3JaI4ZhwZO5Wy2',
    title: 'Предложение принято',
    message: 'Ваше предложение принято. Курьер забирает посылку.',
    type: 'offer_accepted',
    read: false,
    created_at: new Date('2024-01-15T11:00:00'),
    related_delivery_id: 1
  },
  {
    id: 3,
    user_id: 'other-user-uid', // получатель посылки
    title: 'Вам отправили посылку',
    message: 'Анна Коваль отправила вам посылку. Курьер уже в пути.',
    type: 'incoming_delivery',
    read: false,
    created_at: new Date('2024-01-15T12:00:00'),
    related_delivery_id: 1
  },
  {
    id: 4,
    user_id: 'm9VpYOgStCgV6b3JaI4ZhwZO5Wy2',
    title: 'Посылка забрана',
    message: 'Курьер забрал вашу посылку и направляется к получателю.',
    type: 'status_update',
    read: true,
    created_at: new Date('2024-01-15T13:00:00'),
    related_delivery_id: 1
  },
  {
    id: 5,
    user_id: 'other-user-uid',
    title: 'Курьер в пути',
    message: 'Курьер забрал посылку и направляется к вам.',
    type: 'status_update',
    read: false,
    created_at: new Date('2024-01-15T13:05:00'),
    related_delivery_id: 1
  },
  {
    id: 6,
    user_id: 'm9VpYOgStCgV6b3JaI4ZhwZO5Wy2',
    title: 'Новое предложение',
    message: 'Курьер предложил доставить вашу посылку за 50 BYN',
    type: 'offer_received',
    read: false,
    created_at: new Date('2024-01-15T10:00:00'),
    related_delivery_id: 1
  },
  {
    id: 7,
    user_id: 'm9VpYOgStCgV6b3JaI4ZhwZO5Wy2',
    title: 'Новое предложение',
    message: 'Курьер предложил доставить вашу посылку за 50 BYN',
    type: 'offer_received',
    read: false,
    created_at: new Date('2024-01-15T10:00:00'),
    related_delivery_id: 1
  },
];
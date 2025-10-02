import { DeliveryDto } from 'src/delivery/dto/delivery.dto';

// Мок данные для доставок
// В реальном приложении эти данные будут храниться в PostgreSQL
export const MOCK_DELIVERY_REQUESTS: DeliveryDto[] = [
  {
    id: 1,
    senderId: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1',  // ⭐ Ваш реальный UID
    pickerId: '2',                        // UID курьера
    recipientId: '3',                     // UID получателя посылки
    title: 'Документы для визы',          // Название посылки
    description: 'Срочно, нужны завтра утром',  // Описание
    fromAddress: 'ул. Ленина 10, Минск',  // Адрес откуда
    toAddress: 'пр. Победителей 5, Гродно',  // Адрес куда
    price: 100,                           // Цена доставки
    size: 'small',                        // Размер посылки
    weight: 0.5,                          // Вес в кг
    status: 'accepted',                   // Статус: курьер принял заказ
    notes: 'Позвонить за 10 минут до приезда',  // Заметки
    deliveriesUrl: 'https://track.example.com/1',  // URL отслеживания
    createdAt: new Date('2025-01-15'),    // Дата создания
    updatedAt: new Date('2025-01-15'),    // Дата обновления
  },
  {
    id: 2,
    senderId: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1',  // ⭐ Ваш реальный UID
    pickerId: null,                       // Нет курьера - доставка в статусе pending
    recipientId: undefined,               // Нет получателя
    title: 'Цветы',
    description: 'Букет роз, хрупкое',
    fromAddress: 'ул. Советская 25, Минск',
    toAddress: 'пр. Машерова 12, Минск',
    price: 50,
    size: 'medium',
    weight: 2.0,
    status: 'pending',                    // Ожидает принятия курьером
    notes: undefined,
    deliveriesUrl: undefined,
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16'),
  },
  {
    id: 3,
    senderId: '4',
    pickerId: '2',
    recipientId: '5',
    title: 'Ноутбук',
    description: 'MacBook Pro, застрахован',
    fromAddress: 'ул. Немига 3, Минск',
    toAddress: 'ул. Богдановича 155, Минск',
    price: 150,
    size: 'large',
    weight: 3.5,
    status: 'picked_up',                  // Курьер забрал посылку
    notes: 'Осторожно, хрупкое!',
    deliveriesUrl: 'https://track.example.com/3',
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-15'),
  },
];

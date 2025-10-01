// DTO для работы с mock данными (временно, пока используем строковые UID)
// Используется для возврата данных о доставке клиенту
export interface DeliveryDto {
  // Уникальный ID доставки
  id: number;

  // Firebase UID отправителя
  senderId: string;

  // Firebase UID курьера (может быть null если доставка ещё не принята)
  pickerId: string | null;

  // Firebase UID получателя (опционально)
  recipientId?: string;

  // Название посылки
  title: string;

  // Описание посылки
  description?: string;

  // Адрес откуда забрать
  fromAddress: string;

  // Адрес куда доставить
  toAddress: string;

  // Цена доставки
  price: number;

  // Размер: 'small' | 'medium' | 'large'
  size: 'small' | 'medium' | 'large';

  // Вес в кг (опционально)
  weight?: number;

  // Статус доставки:
  // - pending: ожидает принятия курьером
  // - accepted: курьер принял заказ
  // - picked_up: курьер забрал посылку
  // - delivered: доставлено
  // - cancelled: отменено
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  // Дополнительные заметки
  notes?: string;

  // URL для отслеживания доставки (опционально)
  deliveriesUrl?: string;

  // Дата создания заявки
  createdAt: Date;

  // Дата последнего обновления
  updatedAt: Date;
}

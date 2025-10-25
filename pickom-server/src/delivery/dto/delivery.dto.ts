// User info for relations in DeliveryDto
export interface UserInfo {
  uid: string;
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  rating?: number;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

// DTO для возврата данных о доставке клиенту
// Использует Firebase UID для идентификации пользователей
export interface DeliveryDto {
  // Уникальный ID доставки (автоинкремент из БД)
  id: number;

  // Firebase UID отправителя
  senderId: string | null;

  // Firebase UID курьера (может быть null если доставка ещё не принята)
  pickerId: string | null;

  // Firebase UID получателя (опционально)
  recipientId?: string | null;

  // Sender object with full info
  sender?: UserInfo | null;

  // Picker object with full info
  picker?: UserInfo | null;

  // Recipient object with full info
  recipient?: UserInfo | null;

  // Название посылки
  title: string;

  // Описание посылки
  description?: string | null;

  fromLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;

  toLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;

  deliveryType?: 'within-city' | 'inter-city';

  price: number;

  // Размер: 'small' | 'medium' | 'large'
  size: 'small' | 'medium' | 'large';

  // Вес в кг (опционально)
  weight?: number | null;

  // Статус доставки:
  // - pending: ожидает принятия курьером
  // - accepted: курьер принял заказ
  // - picked_up: курьер забрал посылку
  // - delivered: доставлено
  // - cancelled: отменено
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  // Дополнительные заметки
  notes?: string | null;

  // URL для отслеживания доставки (опционально)
  deliveriesUrl?: string | null;

  // Дата создания заявки
  createdAt: Date;

  // Дата последнего обновления
  updatedAt: Date;
}

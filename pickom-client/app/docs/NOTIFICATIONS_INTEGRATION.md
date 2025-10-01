# 📬 Интеграция системы уведомлений Pickom

## 🎯 Обзор

Этот документ описывает полную интеграцию методов `NotificationService` из серверной части в клиентское приложение Pickom. Система позволяет создавать, читать и управлять уведомлениями для пользователей.

## 🏗️ Архитектура

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Client  │ ←──────────────→ │  NestJS Server  │
│                 │                 │                 │
│ useNotifications│                 │NotificationService│
│ notificationsAPI│                 │NotificationController│
└─────────────────┘                 └─────────────────┘
```

## 📋 Доступные методы

### 🔍 Методы чтения

| Метод | Описание | Эндпоинт |
|-------|----------|----------|
| `getUserNotifications()` | Получить все уведомления пользователя | `GET /notifications` |
| `getUnreadCount()` | Получить количество непрочитанных | `GET /notifications/unread-count` |

### ✏️ Методы управления

| Метод | Описание | Эндпоинт |
|-------|----------|----------|
| `markAsRead(id)` | Отметить уведомление как прочитанное | `PATCH /notifications/:id/read` |
| `markAllAsRead()` | Отметить все уведомления как прочитанные | `PATCH /notifications/mark-all-read` |

### ✨ Методы создания

| Метод | Описание | Эндпоинт |
|-------|----------|----------|
| `notifyOfferReceived()` | Уведомление о новом предложении | `POST /notifications/offer-received` |
| `notifyOfferAccepted()` | Уведомление о принятии предложения | `POST /notifications/offer-accepted` |
| `notifyIncomingDelivery()` | Уведомление о входящей доставке | `POST /notifications/incoming-delivery` |
| `notifyStatusUpdate()` | Уведомление об обновлении статуса | `POST /notifications/status-update` |
| `createNotification()` | Создать произвольное уведомление | `POST /notifications/create` |

## 💻 Примеры использования

### 1. Базовое использование в компоненте

```tsx
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h2>Уведомления ({unreadCount} непрочитанных)</h2>

      {unreadCount > 0 && (
        <button onClick={markAllAsRead}>
          Отметить все как прочитанные
        </button>
      )}

      {notifications.map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <span>{notification.read ? '✓' : '●'}</span>
        </div>
      ))}
    </div>
  );
}
```

### 2. Создание уведомления о новом предложении

```tsx
import { useNotifications } from '../hooks/useNotifications';

export default function OfferComponent() {
  const { createOfferReceivedNotification } = useNotifications();

  const handleNewOffer = async () => {
    try {
      await createOfferReceivedNotification({
        senderId: 'user-123',
        deliveryId: 456,
        pickerName: 'Иван Петров',
        price: 25,
      });
      console.log('Уведомление создано!');
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <button onClick={handleNewOffer}>
      Отправить предложение
    </button>
  );
}
```

### 3. Уведомление об обновлении статуса доставки

```tsx
import { useNotifications } from '../hooks/useNotifications';

export default function DeliveryTracker() {
  const { createStatusUpdateNotification } = useNotifications();

  const updateDeliveryStatus = async (status: string) => {
    const statusMessages = {
      picked_up: 'Курьер забрал вашу посылку',
      in_transit: 'Посылка в пути',
      delivered: 'Посылка доставлена',
    };

    await createStatusUpdateNotification({
      userId: 'recipient-id',
      deliveryId: 789,
      status,
      message: statusMessages[status] || 'Статус обновлен',
    });
  };

  return (
    <div>
      <button onClick={() => updateDeliveryStatus('picked_up')}>
        Забрать посылку
      </button>
      <button onClick={() => updateDeliveryStatus('delivered')}>
        Доставить посылку
      </button>
    </div>
  );
}
```

### 4. Создание кастомного уведомления

```tsx
import { useNotifications } from '../hooks/useNotifications';

export default function CustomNotification() {
  const { createCustomNotification } = useNotifications();

  const sendPromoNotification = async () => {
    await createCustomNotification({
      user_id: 'user-123',
      title: '🎉 Специальное предложение!',
      message: 'Скидка 20% на следующую доставку до конца недели!',
      type: 'new_delivery',
      read: false,
      related_delivery_id: null,
    });
  };

  return (
    <button onClick={sendPromoNotification}>
      Отправить промо-уведомление
    </button>
  );
}
```

## 🔧 Типы данных

### Notification
```typescript
interface Notification {
  id: number;
  user_id: string; // Firebase UID
  title: string;
  message: string;
  type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery' | 'new_delivery';
  read: boolean;
  created_at: string; // ISO string
  related_delivery_id?: number;
}
```

### Запросы для создания уведомлений
```typescript
// Новое предложение
interface OfferReceivedRequest {
  senderId: string;
  deliveryId: number;
  pickerName: string;
  price: number;
}

// Принятие предложения
interface OfferAcceptedRequest {
  senderId: string;
  deliveryId: number;
}

// Входящая доставка
interface IncomingDeliveryRequest {
  recipientId: string;
  deliveryId: number;
  senderName: string;
}

// Обновление статуса
interface StatusUpdateRequest {
  userId: string;
  deliveryId: number;
  status: string;
  message: string;
}

// Произвольное уведомление
interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery' | 'new_delivery';
  read: boolean;
  related_delivery_id?: number;
}
```

## 🔐 Аутентификация

Все API запросы автоматически включают Firebase токен через interceptor:

```typescript
// В base.ts настроен interceptor
protectedFetch.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

## 🚀 Интеграция в существующие компоненты

### Добавление в существующий компонент

```tsx
// Добавить импорт
import { useNotifications } from '../hooks/useNotifications';

// В компоненте
const { createOfferReceivedNotification } = useNotifications();

// Использовать при создании предложения
const handleCreateOffer = async (offerData) => {
  // ... логика создания предложения

  // Создать уведомление
  await createOfferReceivedNotification({
    senderId: offer.senderId,
    deliveryId: offer.deliveryId,
    pickerName: currentUser.name,
    price: offer.price,
  });
};
```

## 📱 Real-time обновления

Для real-time обновлений рекомендуется:

1. **WebSocket интеграция** - для мгновенных уведомлений
2. **Push уведомления** - для уведомлений вне приложения
3. **Polling** - как fallback решение

```tsx
// Пример с polling
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000); // Обновлять каждые 30 секунд

  return () => clearInterval(interval);
}, [fetchNotifications]);
```

## 🎨 UI компоненты

Система включает готовые компоненты:

- `NotificationList` - список уведомлений
- `NotificationBadge` - бейдж с количеством
- `NotificationActions` - демо кнопки для тестирования

## 🔄 Обработка ошибок

Все методы включают обработку ошибок с toast-уведомлениями:

```typescript
try {
  await createOfferReceivedNotification(data);
  // Успех - автоматический toast
} catch (error) {
  // Ошибка - автоматический toast с описанием
  console.error('Detailed error:', error);
}
```

## 🧪 Тестирование

Используйте компонент `NotificationActions` для тестирования всех методов:

```tsx
import NotificationActions from './components/NotificationActions';

// В вашем тестовом компоненте
<NotificationActions />
```

## 🛠️ Настройка

1. **Серверная часть**: Уже настроена с эндпоинтами
2. **Клиентская часть**: Готова к использованию
3. **Firebase Auth**: Настроен interceptor для автоматической аутентификации

## 📊 Мониторинг

Все действия логируются в консоль для отладки:
- Успешные создания уведомлений
- Ошибки API запросов
- Состояние загрузки

---

*Документация обновлена: 30.09.2025*
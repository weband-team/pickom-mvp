# 🚀 Быстрый старт: Система уведомлений

## ⚡ Основное использование

```tsx
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const {
    notifications,           // Все уведомления
    unreadCount,            // Количество непрочитанных
    markAsRead,             // Отметить как прочитанное
    markAllAsRead,          // Отметить все как прочитанные

    // Создание уведомлений
    createOfferReceivedNotification,
    createOfferAcceptedNotification,
    createIncomingDeliveryNotification,
    createStatusUpdateNotification,
    createCustomNotification,
  } = useNotifications();

  return (
    <div>
      <h2>Уведомления ({unreadCount})</h2>

      {notifications.map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          {notification.title}
        </div>
      ))}

      <button onClick={markAllAsRead}>Отметить все</button>
    </div>
  );
}
```

## 📝 Создание уведомлений

### Новое предложение курьера
```tsx
await createOfferReceivedNotification({
  senderId: 'user-id',
  deliveryId: 123,
  pickerName: 'Иван Петров',
  price: 25,
});
```

### Принятие предложения
```tsx
await createOfferAcceptedNotification({
  senderId: 'user-id',
  deliveryId: 123,
});
```

### Входящая доставка
```tsx
await createIncomingDeliveryNotification({
  recipientId: 'user-id',
  deliveryId: 123,
  senderName: 'Анна Коваль',
});
```

### Обновление статуса
```tsx
await createStatusUpdateNotification({
  userId: 'user-id',
  deliveryId: 123,
  status: 'picked_up',
  message: 'Курьер забрал посылку',
});
```

### Кастомное уведомление
```tsx
await createCustomNotification({
  user_id: 'user-id',
  title: 'Заголовок',
  message: 'Сообщение',
  type: 'new_delivery',
  read: false,
});
```

## 🎨 Готовые компоненты

```tsx
import NotificationList from './components/NotificationList';
import NotificationBadge from './components/NotificationBadge';
import NotificationActions from './components/NotificationActions'; // Для тестирования

function App() {
  return (
    <div>
      <NotificationBadge />
      <NotificationList />
      <NotificationActions /> {/* Демо кнопки */}
    </div>
  );
}
```

## 🔧 API эндпоинты

- `GET /notifications` - получить уведомления
- `GET /notifications/unread-count` - количество непрочитанных
- `PATCH /notifications/:id/read` - отметить как прочитанное
- `PATCH /notifications/mark-all-read` - отметить все
- `POST /notifications/offer-received` - новое предложение
- `POST /notifications/offer-accepted` - принятие предложения
- `POST /notifications/incoming-delivery` - входящая доставка
- `POST /notifications/status-update` - обновление статуса
- `POST /notifications/create` - кастомное уведомление

## 🔐 Аутентификация

Firebase токен добавляется автоматически ко всем запросам.

## 🎯 Типы уведомлений

- `offer_received` - Новое предложение курьера
- `offer_accepted` - Предложение принято
- `status_update` - Обновление статуса доставки
- `incoming_delivery` - Входящая доставка
- `new_delivery` - Новая доставка

---

📚 [Полная документация](./NOTIFICATIONS_INTEGRATION.md)
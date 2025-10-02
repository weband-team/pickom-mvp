# Onboarding: Система оповещений для приема заказов Sender

## Обзор проекта Pickom
**Pickom** - приложение доставки с архитектурой:
- **Backend**: NestJS + TypeScript + Mock данные + Firebase Admin
- **Frontend**: Next.js + React + Capacitor + Firebase Client + react-hot-toast
- **Структура данных**: По схеме `database-mvp-simple.md` (без реальной БД)

## Роли пользователей
- **Sender** - создает заявки на доставку
- **Picker (Driver)** - принимает предложения на доставку

## Текущее состояние кодовой базы

### Backend структура
```
pickom-server/src/
├── auth/ - Firebase аутентификация
├── delivery/ - Управление заказами доставки
├── offer/ - Предложения на доставку (базовая реализация)
├── user/ - Управление пользователями
├── mocks/ - Mock данные
└── config/ - Конфигурация
```

### Frontend структура
```
pickom-client/app/
├── auth/ - Страницы аутентификации
├── components/ - UI компоненты (включая Toast.tsx)
├── context/ - React контексты (OrderContext.tsx)
├── api/ - API клиенты
└── [страницы] - Next.js страницы
```

### Существующие возможности
1. ✅ Toast уведомления (react-hot-toast настроен)
2. ✅ Firebase аутентификация
3. ✅ Базовая система offer (нужно доработать)
4. ✅ OrderContext для управления заказами
5. ✅ Mock данные для тестирования

## Структура данных для уведомлений (MVP)

### Notification Interface
```typescript
interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'new_delivery' | 'offer_received' | 'offer_accepted' | 'status_update' | 'rating';
  read: boolean;
  created_at: Date;
}
```

### Обновленная Offer Interface
```typescript
interface Offer {
  id: number;
  delivery_id: number;
  picker_id: number;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}
```

## Задача: Система оповещений при приеме заказа

### Описание флоу
1. Picker создает offer на delivery заказ Sender'а
2. Система автоматически создает notification для Sender'а
3. Sender получает уведомление в реальном времени
4. Sender может просмотреть и отметить уведомление как прочитанное

### Компоненты для реализации

#### Backend (NestJS)
1. **NotificationService** - управление уведомлениями
2. **NotificationController** - API endpoints
3. **Обновленный OfferService** - интеграция с уведомлениями
4. **Mock данные** - тестовые уведомления

#### Frontend (React/Next.js)
1. **NotificationList компонент** - отображение списка
2. **useNotifications hook** - получение данных
3. **Интеграция в UI** - показ в интерфейсе Sender

### Технические требования
- Использовать только mock данные (без реальной БД)
- Следовать структуре MVP из `database-mvp-simple.md`
- Интегрироваться с существующей Toast системой
- Сохранить совместимость с Firebase аутентификацией

## План тестирования
1. **Unit тесты**: NotificationService методы
2. **Интеграционные тесты**: Offer → Notification flow
3. **UI тесты**: Компоненты уведомлений
4. **E2E тест**: Полный флоу Picker создает offer → Sender получает уведомление

## Файлы для изменения/создания
### Backend
- `src/notification/notification.service.ts` (создать)
- `src/notification/notification.controller.ts` (создать)
- `src/notification/notification.module.ts` (создать)
- `src/offer/offer.service.ts` (обновить)
- `src/offer/entities/offer.entity.ts` (обновить)
- `src/mocks/notification.mock.ts` (создать)
- `src/app.module.ts` (добавить NotificationModule)

### Frontend
- `app/components/NotificationList.tsx` (создать)
- `app/hooks/useNotifications.ts` (создать)
- `app/api/notifications.ts` (создать)
- Обновить существующие страницы для интеграции

## Готов к реализации ✅
Все необходимая информация собрана, структура понята, план готов к выполнению.
# Архитектура Pickom MVP: Полное объяснение

Этот документ объясняет, как работает весь стек приложения от фронтенда до базы данных и обратно. Используем систему уведомлений как основной пример.

## 🎨 1. Frontend: React Компоненты и Страницы (Next.js 15)

### Структура страницы
В Next.js 15 с App Router, каждая папка в `app/` — это роут:

```
app/
  notifications/
    page.tsx          ← URL: /notifications
  delivery-methods/
    page.tsx          ← URL: /delivery-methods
  orders/
    [id]/            ← Динамический роут
      page.tsx        ← URL: /orders/123
```

### Пример: Страница уведомлений
**Файл: `pickom-client/app/notifications/page.tsx`**

```typescript
'use client';  // ← Обязательно для интерактивных компонентов

export default function NotificationsPage() {
  // 1. Используем кастомный хук для получения данных
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // 2. Рендерим UI с Material-UI компонентами
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5">
          Уведомления
          {unreadCount > 0 && <Chip label={unreadCount} />}
        </Typography>
      </Box>

      {/* Список уведомлений */}
      {notifications.map((notification) => (
        <Box
          key={notification.id}
          onClick={() => {
            if (!notification.read) markAsRead(notification.id);

            // Навигация в зависимости от типа
            if (notification.type === 'new_delivery') {
              router.push(`/delivery-details/${notification.related_delivery_id}`);
            }
          }}
        >
          <Typography>{notification.title}</Typography>
          <Typography>{notification.message}</Typography>
        </Box>
      ))}
    </Box>
  );
}
```

### Компоненты - переиспользуемые блоки
**Файл: `pickom-client/components/picker/MyPickerCard.tsx`**

```typescript
interface MyPickerCardProps {
  isOnline: boolean;
  price: number;
  rating: number;
  onToggleOnline: () => void;
}

export default function MyPickerCard({
  isOnline,
  price,
  rating,
  onToggleOnline
}: MyPickerCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography>Base price: {price} zł</Typography>
        <Typography>Rating: ⭐ {rating.toFixed(1)}</Typography>
        <Button onClick={onToggleOnline}>
          {isOnline ? 'Go Offline' : 'Go Online'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

Этот компонент можно использовать на любой странице:
```typescript
// В delivery-methods/page.tsx
<MyPickerCard
  isOnline={pickerSettings.isOnline}
  price={pickerSettings.basePrice}
  rating={pickerSettings.rating}
  onToggleOnline={handleToggleOnline}
/>
```

## 📡 2. API Layer: Связь Frontend ↔ Backend

### Структура API клиента
**Файл: `pickom-client/app/api/base.ts`**

```typescript
import axios from 'axios';

// Создаем настроенный axios instance
export const api = axios.create({
  baseURL: 'http://localhost:4242',  // URL сервера
  withCredentials: true,              // Отправляем cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### API модуль для уведомлений
**Пример: `pickom-client/app/api/notifications.ts`**

```typescript
import { api } from './base';
import { NotificationDto } from './dto/notification';

export const notificationsAPI = {
  // GET /notifications
  getUserNotifications: async (): Promise<NotificationDto[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // GET /notifications/unread-count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // POST /notifications
  createNotification: async (data: CreateNotificationDto): Promise<NotificationDto> => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  // PATCH /notifications/:id/read
  markAsRead: async (id: number): Promise<NotificationDto> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // PATCH /notifications/mark-all-read
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/mark-all-read');
  },
};
```

### DTO (Data Transfer Object)
**Файл: `pickom-server/src/notification/dto/notification.dto.ts`**

```typescript
export class NotificationDto {
  id: number;
  user_id: string;           // Firebase UID
  title: string;
  message: string;
  type: 'new_delivery' | 'offer_received' | 'status_update' | 'offer_accepted' | 'incoming_delivery' | 'new_message';
  read: boolean;
  created_at: Date;
  related_delivery_id?: number;  // Ссылка на связанную доставку
}
```

**DTO — это контракт между frontend и backend.** Он определяет:
- Какие поля приходят/уходят
- Типы данных
- Обязательные/опциональные поля

## 🔧 3. Backend: NestJS Architecture

### Модуль (Module)
**Файл: `pickom-server/src/notification/notification.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User])  // Подключаем entities
  ],
  controllers: [NotificationController],  // Регистрируем контроллер
  providers: [NotificationService],       // Регистрируем сервис
  exports: [NotificationService],         // Экспортируем для других модулей
})
export class NotificationModule {}
```

### Entity (Сущность БД)
**Файл: `pickom-server/src/notification/entities/notification.entity.ts`**

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')  // ← Имя таблицы в PostgreSQL
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id' })  // ← Колонка в БД
  userId: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['new_delivery', 'offer_received', 'status_update', 'offer_accepted', 'incoming_delivery', 'new_message'],
  })
  type: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ name: 'related_delivery_id', nullable: true })
  relatedDeliveryId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Связь Many-to-One с User
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### Controller (Обработчик HTTP запросов)
**Пример: `pickom-server/src/notification/notification.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dto/notification.dto';

@Controller('notifications')  // ← Базовый путь: /notifications
@UseGuards(FirebaseAuthGuard)  // ← Проверка авторизации для всех эндпоинтов
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // GET /notifications
  @Get()
  async getUserNotifications(@Request() req): Promise<NotificationDto[]> {
    const userId = req.user.uid;  // Получаем из JWT токена
    return await this.notificationService.getUserNotifications(userId);
  }

  // GET /notifications/unread-count
  @Get('unread-count')
  async getUnreadCount(@Request() req): Promise<number> {
    const userId = req.user.uid;
    return await this.notificationService.getUnreadCount(userId);
  }

  // POST /notifications
  @Post()
  async createNotification(@Body() dto: NotificationDto): Promise<NotificationDto> {
    return await this.notificationService.createNotification(dto);
  }

  // PATCH /notifications/:id/read
  @Patch(':id/read')
  async markAsRead(@Param('id') id: number): Promise<NotificationDto> {
    return await this.notificationService.markAsRead(id);
  }

  // PATCH /notifications/mark-all-read
  @Patch('mark-all-read')
  async markAllAsRead(@Request() req): Promise<void> {
    const userId = req.user.uid;
    await this.notificationService.markAllAsRead(userId);
  }
}
```

### Service (Бизнес-логика)
**Файл: `pickom-server/src/notification/notification.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationDto } from './dto/notification.dto';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,  // ← TypeORM репозиторий
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createNotification(
    notificationData: Omit<NotificationDto, 'id' | 'created_at'>,
  ): Promise<NotificationDto> {
    // 1. Находим пользователя по Firebase UID
    const user = await this.userRepository.findOne({
      where: { uid: notificationData.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with uid ${notificationData.user_id} not found`);
    }

    // 2. Создаем notification entity
    const notification = this.notificationRepository.create({
      userId: user.id,  // ← Используем внутренний ID из БД
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      read: notificationData.read ?? false,
      relatedDeliveryId: notificationData.related_delivery_id,
    });

    // 3. Сохраняем в БД
    const savedNotification = await this.notificationRepository.save(notification);

    // 4. Преобразуем в DTO для ответа
    return this.mapToDto(savedNotification, user.uid);
  }

  async getUserNotifications(userId: string): Promise<NotificationDto[]> {
    // 1. Находим пользователя
    const user = await this.userRepository.findOne({
      where: { uid: userId },
    });

    if (!user) {
      return [];
    }

    // 2. Получаем все уведомления пользователя
    const notifications = await this.notificationRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },  // ← Сортировка
      relations: ['user'],            // ← Загружаем связанного пользователя
    });

    // 3. Преобразуем в DTO
    return notifications.map((n) => this.mapToDto(n, user.uid));
  }

  async markAsRead(notificationId: number): Promise<NotificationDto | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });

    if (!notification) {
      return null;
    }

    // Обновляем поле
    notification.read = true;
    const updated = await this.notificationRepository.save(notification);

    return this.mapToDto(updated, notification.user.uid);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uid: userId },
    });

    if (!user) {
      return;
    }

    // Массовое обновление
    await this.notificationRepository.update(
      { userId: user.id, read: false },
      { read: true },
    );
  }

  // Вспомогательный метод для маппинга Entity → DTO
  private mapToDto(notification: Notification, userUid: string): NotificationDto {
    return {
      id: notification.id,
      user_id: userUid,  // ← Возвращаем Firebase UID, а не внутренний ID
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      created_at: notification.createdAt,
      related_delivery_id: notification.relatedDeliveryId,
    };
  }

  // Специализированный метод для создания уведомления о новом предложении
  async notifyOfferReceived(
    senderId: string,
    deliveryId: number,
    pickerName: string,
    price: number,
  ): Promise<NotificationDto> {
    return await this.createNotification({
      user_id: senderId,
      title: 'Новое предложение',
      message: `Курьер ${pickerName} предложил доставить вашу посылку за ${price} BYN`,
      type: 'offer_received',
      read: false,
      related_delivery_id: deliveryId,
    });
  }
}
```

## 🔄 4. Полный поток данных: Пример создания приглашения

### Сценарий: Sender выбирает пикера и отправляет приглашение

**1. Frontend: Пользователь кликает на пикера**
```typescript
// pickom-client/app/picker-results/page.tsx

const handleSelectPicker = async (pickerId: string) => {
  // Получаем текущего пользователя
  const { user: currentUser } = await getCurrentUser();

  // Отправляем запрос на создание уведомления
  await notificationsAPI.createNotification({
    user_id: pickerId,  // ← Кому отправляем
    title: 'New Delivery Invitation',
    message: `${currentUser.name} invited you to deliver a package...`,
    type: 'new_delivery',
    read: false,
    related_delivery_id: deliveryId,
  });
};
```

**2. API Layer: Axios делает HTTP запрос**
```typescript
// pickom-client/app/api/notifications.ts

createNotification: async (data: CreateNotificationDto) => {
  const response = await api.post('/notifications', data);
  //                          ↓
  //          POST http://localhost:4242/notifications
  //          Headers: { Content-Type: application/json }
  //          Body: { user_id: "picker123", title: "...", ... }
  //                          ↓
  return response.data;
}
```

**3. Backend Controller: Принимает запрос**
```typescript
// pickom-server/src/notification/notification.controller.ts

@Post()
async createNotification(@Body() dto: NotificationDto): Promise<NotificationDto> {
  //                      ↑ NestJS автоматически парсит JSON в DTO
  return await this.notificationService.createNotification(dto);
  //                                    ↓ Передаем в сервис
}
```

**4. Service: Бизнес-логика**
```typescript
// pickom-server/src/notification/notification.service.ts

async createNotification(notificationData) {
  // 4.1: Находим пользователя в БД
  const user = await this.userRepository.findOne({
    where: { uid: notificationData.user_id },  // Firebase UID
  });
  // SELECT * FROM users WHERE uid = 'picker123'

  // 4.2: Создаем notification entity
  const notification = this.notificationRepository.create({
    userId: user.id,  // Внутренний ID из БД (например, 42)
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    read: false,
    relatedDeliveryId: notificationData.related_delivery_id,
  });

  // 4.3: Сохраняем в БД
  const saved = await this.notificationRepository.save(notification);
  // INSERT INTO notifications (user_id, title, message, type, read, related_delivery_id, created_at)
  // VALUES (42, 'New Delivery Invitation', '...', 'new_delivery', false, 123, NOW())

  // 4.4: Преобразуем Entity → DTO для ответа
  return this.mapToDto(saved, user.uid);
  // { id: 456, user_id: 'picker123', title: '...', ... }
}
```

**5. Response: Данные возвращаются обратно**
```
Backend Controller → HTTP Response → Frontend API → Component
         ↓                  ↓              ↓            ↓
  NotificationDto  →  JSON  →  Promise  →  State update
```

**6. Frontend: Обновляем UI**
```typescript
// После успешного создания уведомления
setSuccessMessage('Invitation sent!');
router.push('/orders');  // Перенаправляем пользователя
```

## 📊 5. Связь между Entity, DTO и Database

### Entity (Notification) ↔ Database Table

```sql
-- PostgreSQL таблица (создается автоматически через TypeORM)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT false,
  related_delivery_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Entity → DTO маппинг

```typescript
// Entity (внутренняя структура БД)
class Notification {
  id: number;              // AUTO INCREMENT
  userId: number;          // Внутренний ID пользователя
  title: string;
  message: string;
  type: string;
  read: boolean;
  relatedDeliveryId: number;
  createdAt: Date;
  user: User;              // Связь с User entity
}

// DTO (для API)
class NotificationDto {
  id: number;
  user_id: string;         // Firebase UID (не внутренний ID!)
  title: string;
  message: string;
  type: string;
  read: boolean;
  related_delivery_id: number;
  created_at: Date;
}
```

**Почему разные?**
- Entity использует внутренний `userId` (число) для связи в БД
- DTO использует `user_id` (строка) — это Firebase UID для frontend
- Entity имеет связь `user: User`, DTO — нет (чтобы не передавать лишние данные)

## 🔐 6. Аутентификация: Firebase Guard

```typescript
// pickom-server/src/auth/guards/firebase-auth.guard.ts

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Извлекаем токен из cookie или header
    const token = request.cookies?.session || request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // 2. Проверяем токен через Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 3. Добавляем данные пользователя в request
    request.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    return true;
  }
}
```

Теперь в любом контроллере с `@UseGuards(FirebaseAuthGuard)`:
```typescript
@Get()
async getUserData(@Request() req) {
  const userId = req.user.uid;  // ← Получаем из проверенного токена
  // ...
}
```

## 📝 Весь поток в одной диаграмме

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
│  Клик на кнопку "Select Picker" в picker-results/page.tsx       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENT                            │
│  handleSelectPicker() → notificationsAPI.createNotification()    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Axios)                           │
│  api.post('/notifications', { user_id, title, message, ... })   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼ Network Request
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND CONTROLLER                              │
│  @Post() createNotification(@Body() dto: NotificationDto)        │
│  → Firebase Guard проверяет токен                                │
│  → Передает DTO в сервис                                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE (Business Logic)                     │
│  1. userRepository.findOne({ uid: dto.user_id })                │
│  2. notificationRepository.create({ ... })                       │
│  3. notificationRepository.save(notification)                    │
│  4. mapToDto(notification, user.uid)                             │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼ TypeORM SQL Query
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  INSERT INTO notifications (...) VALUES (...)                    │
│  RETURNING *                                                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼ Response (NotificationDto)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CONTROLLER                            │
│  return notificationDto;  →  { id, user_id, title, ... }         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼ HTTP 200 JSON Response
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Axios)                           │
│  response.data  →  NotificationDto                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENT                            │
│  setSuccessMessage('Invitation sent!')                          │
│  router.push('/orders')                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 💡 Ключевые концепции

1. **Separation of Concerns**: Каждый слой делает свою работу
   - Component: UI и user interactions
   - API Layer: HTTP requests
   - Controller: HTTP routing
   - Service: Business logic
   - Repository: Database operations

2. **Type Safety**: TypeScript + DTO обеспечивают контракт между слоями

3. **Dependency Injection**: NestJS автоматически создает и внедряет зависимости (repositories, services)

4. **Entity vs DTO**:
   - Entity = структура БД (с внутренними ID, связями)
   - DTO = структура API (с Firebase UID, без лишних данных)

5. **Guards**: Middleware для проверки авторизации перед выполнением контроллера

## 🚀 Практические примеры из проекта

### Пример 1: Создание новой доставки

**Frontend → Backend → Database**

1. **Component** (`pickom-client/app/send-package/page.tsx`):
   ```typescript
   const handleCreateDelivery = async () => {
     const deliveryData = {
       senderId: currentUser.uid,
       fromAddress: '...',
       toAddress: '...',
       packageSize: 'medium',
       deliveryMethod: 'express'
     };

     const newDelivery = await deliveryAPI.createDelivery(deliveryData);
     router.push(`/orders/${newDelivery.id}`);
   };
   ```

2. **API Layer** (`pickom-client/app/api/delivery.ts`):
   ```typescript
   export const deliveryAPI = {
     createDelivery: async (data: CreateDeliveryDto) => {
       const response = await api.post('/delivery', data);
       return response.data;
     }
   };
   ```

3. **Controller** (`pickom-server/src/delivery/delivery.controller.ts`):
   ```typescript
   @Post()
   @UseGuards(FirebaseAuthGuard)
   async createDelivery(@Body() dto: CreateDeliveryDto) {
     return await this.deliveryService.createDelivery(dto);
   }
   ```

4. **Service** (`pickom-server/src/delivery/delivery.service.ts`):
   ```typescript
   async createDelivery(dto: CreateDeliveryDto) {
     const delivery = this.deliveryRepository.create({
       senderId: dto.sender_id,
       fromAddress: dto.from_address,
       toAddress: dto.to_address,
       status: 'pending',
       // ...
     });

     const saved = await this.deliveryRepository.save(delivery);
     return this.mapToDto(saved);
   }
   ```

### Пример 2: Получение списка заказов

**Backend → Frontend → UI**

1. **Service** возвращает список доставок из БД
2. **Controller** преобразует Entity в DTO
3. **API Layer** получает JSON
4. **Component** отображает список в UI

```typescript
// Frontend Component
const { data: orders, isLoading } = useQuery({
  queryKey: ['orders', userId],
  queryFn: () => deliveryAPI.getMyOrders(userId)
});

return (
  <Box>
    {orders.map(order => (
      <OrderCard key={order.id} order={order} />
    ))}
  </Box>
);
```

## 📚 Для дальнейшего изучения

1. **TypeORM Relations**: OneToMany, ManyToOne, ManyToMany
2. **React Query**: Кэширование, инвалидация, оптимистичные обновления
3. **NestJS Pipes**: Валидация и трансформация входных данных
4. **WebSocket**: Реал-тайм уведомления через Socket.io
5. **Testing**: Jest для unit-тестов, Playwright для E2E

---

**Создано для практического изучения Full-Stack разработки на примере Pickom MVP** 🚀

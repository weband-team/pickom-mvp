# Real-Time Tracking Implementation

## Overview

Реализована система отслеживания доставок в реальном времени с использованием WebSocket (Socket.IO). Система автоматически отправляет геопозицию picker'а каждую секунду при движении и каждые 5 секунд при остановке.

## Backend Changes

### 1. Database Schema (tracking table)

**Entity**: `pickom-server/src/traking/entities/traking.entity.ts`

```typescript
@Entity('tracking')
export class Tracking {
  id: number;
  deliveryId: number;
  pickerId: number;
  senderId: number;
  receiverId: number | null;

  // Pickup location (from)
  fromLocation: { lat, lng, address, city?, placeId? };

  // Delivery destination (to)
  toLocation: { lat, lng, address, city?, placeId? };

  // Current picker location (real-time updates)
  pickerLocation: { lat, lng, timestamp } | null;

  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

**Важно**: Записи tracking сохраняются в БД даже после доставки для истории.

### 2. WebSocket Gateway

**File**: `pickom-server/src/traking/traking.gateway.ts`

**Namespace**: `/tracking`

**Events**:

**Client → Server:**
- `join-tracking` - Присоединиться к отслеживанию доставки
  ```typescript
  { deliveryId: number, userId: number }
  ```

- `leave-tracking` - Покинуть отслеживание
  ```typescript
  { deliveryId: number }
  ```

- `update-location` - Обновить позицию picker'а (только для picker)
  ```typescript
  { deliveryId: number, lat: number, lng: number, userId: number }
  ```

- `update-status` - Обновить статус доставки (только для picker)
  ```typescript
  { deliveryId: number, status: string, userId: number }
  ```

**Server → Client:**
- `tracking-data` - Полные данные tracking при подключении
- `location-updated` - Обновление позиции picker'а
  ```typescript
  { deliveryId: number, pickerLocation: { lat, lng, timestamp } }
  ```
- `status-updated` - Обновление статуса доставки
  ```typescript
  { deliveryId: number, status: string }
  ```
- `tracking-completed` - Доставка завершена
- `error` - Ошибка WebSocket

### 3. Access Control

**Контроллер**: `pickom-server/src/traking/traking.controller.ts`

**Endpoints**:
- `GET /traking/:deliveryId` - Получить tracking (только sender/picker/receiver)
- `PUT /traking/:deliveryId/location` - Обновить локацию (только picker)
- `PUT /traking/:deliveryId/status` - Обновить статус (только picker)

**Метод `hasAccess`**: Проверяет, что пользователь является sender, picker или receiver.

### 4. Tracking Creation

**Автоматическое создание tracking** происходит в `DeliveryService.updateDeliveryRequestStatus()` при статусе `'accepted'`:

```typescript
if (status === 'accepted') {
  await this.trackingService.createTracking(delivery.id);
  // Creates chat rooms...
}
```

## Frontend Changes

### 1. WebSocket Hook

**File**: `pickom-client/app/hooks/useWebSocketTracking.ts`

**Хуки**:

#### `useWebSocketTracking`
Основной хук для получения tracking данных в реальном времени.

```typescript
const { isConnected, trackingData, sendLocationUpdate, sendStatusUpdate } = useWebSocketTracking({
  deliveryId: number,
  userId: number,
  enabled: boolean,
  onLocationUpdate?: (location) => void,
  onStatusUpdate?: (status) => void,
  onTrackingData?: (data) => void,
  onError?: (error) => void,
});
```

#### `usePickerLocationTracking`
Хук для picker'а - автоматически отправляет геопозицию.

```typescript
const { isConnected } = usePickerLocationTracking({
  deliveryId: number,
  userId: number,
  enabled: boolean,
});
```

**Умная логика обновления**:
- **Движение** (>10 метров): обновление каждую 1 секунду
- **Остановка** (≤10 метров): обновление каждые 5 секунд

### 2. Tracking Page (для Sender/Receiver)

**File**: `pickom-client/app/tracking/[deliveryId]/page.tsx`

**Изменения**:
- Удален HTTP polling (каждые 3 секунды)
- Добавлен WebSocket для real-time обновлений
- Добавлен индикатор статуса подключения (Live Tracking / Connecting...)
- Автоматический пересчет маршрута при обновлении позиции picker'а

### 3. Active Delivery Page (для Picker)

**File**: `pickom-client/app/active-delivery/[id]/page.tsx`

**Изменения**:
- Заменен старый `useLocationTracking` на `usePickerLocationTracking`
- Автоматическая отправка геопозиции через WebSocket
- Умная логика: 1с при движении, 5с при остановке

## Authentication

WebSocket использует Firebase ID token для аутентификации:

```typescript
// Client-side
const token = await getAuthToken(); // Firebase getIdToken()
const socket = io(`${SOCKET_URL}/tracking`, {
  auth: { token },
  transports: ['websocket'],
});

// Server-side (WsAuthGuard)
const decodedToken = await admin.auth().verifyIdToken(token);
client.data.user = decodedToken;
```

## Distance Calculation

**Haversine Formula** для определения движения:

```typescript
const EARTH_RADIUS = 6371e3; // meters
const MOVING_THRESHOLD = 10; // meters

// Если расстояние от последней позиции > 10м → moving
// Если расстояние ≤ 10м → stationary
```

## Configuration

**Environment Variables**:

Client (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Server (`.env`):
```bash
CLIENT_URI=http://localhost:3000
```

## How It Works

### Flow для Tracking

1. **Picker принимает заказ** → статус `'accepted'`
2. **Создается запись tracking** в БД с from/to locations
3. **Picker отмечает "Picked Up"** → статус `'picked_up'`
4. **Начинается автоматическая отправка геопозиции** через WebSocket
5. **Sender/Receiver видят позицию в реальном времени** на карте
6. **Picker доставляет заказ** → статус `'delivered'`
7. **Tracking запись остается в БД** для истории

### WebSocket Room Architecture

```
delivery-123
├── Sender (client-socket-abc)
├── Picker (client-socket-def) [sends location]
└── Receiver (client-socket-ghi)

Picker sends → update-location
Server broadcasts → location-updated to all in room
```

## Installation & Dependencies

**Backend**:
```bash
cd pickom-server
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Frontend**:
```bash
cd pickom-client
npm install socket.io-client
```

## Testing

1. **Start server**: `cd pickom-server && npm run start:dev`
2. **Start client**: `cd pickom-client && npm run dev`
3. **Create delivery** as sender
4. **Accept delivery** as picker → tracking создается
5. **Mark "Picked Up"** → location tracking активируется
6. **Open tracking page** as sender → видите live позицию
7. **Move picker device** → обновления каждую 1 секунду
8. **Stop moving** → обновления каждые 5 секунд

## Known Issues & Future Improvements

- [ ] Добавить reconnection logic для WebSocket
- [ ] Добавить offline queue для location updates
- [ ] Оптимизация battery consumption на мобильных устройствах
- [ ] Добавить analytics для tracking performance
- [ ] Migration script для существующих deliveries

## API Documentation

### REST API

```
GET    /traking/:deliveryId          - Get tracking data
PUT    /traking/:deliveryId/location - Update picker location
PUT    /traking/:deliveryId/status   - Update tracking status
```

### WebSocket Events

See [WebSocket Gateway](#2-websocket-gateway) section above.

---

**Created**: 2025-11-10
**Author**: Claude Code
**Version**: 1.0

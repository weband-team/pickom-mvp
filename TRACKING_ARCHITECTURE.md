# Архитектура системы отслеживания доставки (Tracking System Architecture)

## Общая схема взаимодействия компонентов

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TRACKING SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────────┐
                    │   Sender & Receiver       │
                    │   (Web/Mobile Browser)    │
                    └───────────┬───────────────┘
                                │
                                │ 1. Opens /tracking/[deliveryId]
                                ▼
                    ┌───────────────────────────┐
                    │    TrackingPage.tsx       │
                    │  (React Component)        │
                    └───────────┬───────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
    │ GET /delivery/   │  │ GET /user/   │  │ Polling Timer   │
    │ requests/:id     │  │ :uid         │  │ (10 sec)        │
    └──────────────────┘  └──────────────┘  └─────────────────┘
                │               │                      │
                │               │                      │
                ▼               ▼                      ▼
    ┌───────────────────────────────────────────────────────────┐
    │              NestJS Backend (API Server)                  │
    ├───────────────────────────────────────────────────────────┤
    │  DeliveryController  │  UserController  │  TrakingController│
    └───────────────────────────────────────────────────────────┘
                │               │                      │
                ▼               ▼                      ▼
    ┌───────────────────────────────────────────────────────────┐
    │                  PostgreSQL Database                      │
    ├───────────────────────────────────────────────────────────┤
    │                                                           │
    │  deliveries table:              users table:             │
    │  - fromLocation (JSONB)         - location (JSONB) ◄─────┼─── ТЕКУЩАЯ ПОЗИЦИЯ ПИКЕРА
    │  - toLocation (JSONB)            {lat, lng, address}     │
    │  - status                       - role (picker/sender)   │
    │  - pickerId (FK)                - isOnline               │
    │                                                           │
    └───────────────────────────────────────────────────────────┘
                                │
                                │ Data flows to frontend
                                ▼
    ┌───────────────────────────────────────────────────────────┐
    │              TrackingMap Component (Leaflet)              │
    ├───────────────────────────────────────────────────────────┤
    │                                                           │
    │  ┌─────────────────────────────────────────────────────┐ │
    │  │         OpenStreetMap Tiles                         │ │
    │  │  https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png│ │
    │  └─────────────────────────────────────────────────────┘ │
    │                                                           │
    │  Markers:                                                 │
    │  🟢 From Location (Green)  - fromLocation                │
    │  🔴 To Location (Red)      - toLocation                  │
    │  🔵 Picker Location (Blue) - user.location (real-time)   │
    │                                                           │
    │  Route:                                                   │
    │  🛣️ Polyline (Blue)        - OSRM calculated route      │
    │                                                           │
    └───────────────────────────────────────────────────────────┘
                                │
                                │ Route calculation
                                ▼
    ┌───────────────────────────────────────────────────────────┐
    │             OSRM API (External Service)                   │
    │  https://router.project-osrm.org/route/v1/driving/...    │
    │                                                           │
    │  Input:  picker.location → toLocation                    │
    │  Output: coordinates[], distance, duration               │
    └───────────────────────────────────────────────────────────┘


    ┌───────────────────────────────────────────────────────────┐
    │                  PICKER SIDE (Mobile App)                 │
    └───────────────────────────────────────────────────────────┘

                    ┌───────────────────────────┐
                    │   Picker (Mobile Device)  │
                    │   Active Delivery Page    │
                    └───────────┬───────────────┘
                                │
                                │ When status = "picked_up"
                                ▼
                    ┌───────────────────────────┐
                    │  Capacitor Geolocation    │
                    │  watchPosition()          │
                    └───────────┬───────────────┘
                                │
                                │ Every 5-10 sec
                                ▼
                    ┌───────────────────────────┐
                    │ PUT /user/:uid/location   │
                    │ {lat, lng, address}       │
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  Update user.location     │
                    │  in PostgreSQL            │
                    └───────────────────────────┘
                                │
                                │ Polling detects change
                                ▼
                    ┌───────────────────────────┐
                    │  Sender/Receiver sees     │
                    │  updated marker position  │
                    └───────────────────────────┘
```

---

## Поток данных (Data Flow)

### 1. Инициализация страницы tracking

```
User opens /tracking/123
          │
          ▼
TrackingPage component mounts
          │
          ├──► GET /delivery/requests/123
          │         │
          │         └──► Returns:
          │               - fromLocation
          │               - toLocation
          │               - status
          │               - picker (with uid)
          │               - sender
          │               - recipient
          │
          └──► GET /user/{picker.uid}
                    │
                    └──► Returns:
                          - location {lat, lng, address}
                          - name, rating, phone
                          - avatarUrl
```

### 2. Real-time обновление местоположения

```
Polling Timer (10 sec interval)
          │
          ▼
GET /user/{picker.uid}
          │
          ▼
Extract picker.location
          │
          ▼
Compare with previous location
          │
          ├──► If changed:
          │         │
          │         ├──► Update pickerLocation state
          │         │
          │         └──► Recalculate route:
          │                   │
          │                   ▼
          │            OSRM API Request
          │            (picker.location → toLocation)
          │                   │
          │                   ▼
          │            Get new route coordinates
          │                   │
          │                   ▼
          │            Update route state
          │                   │
          │                   ▼
          │            Re-render map
          │                   │
          │                   └──► Marker moves + Polyline updates
          │
          └──► If unchanged: Do nothing
```

### 3. Picker обновляет своё местоположение

```
Picker opens Active Delivery page
          │
          └──► If status === "picked_up"
                    │
                    ▼
          Start Geolocation.watchPosition()
                    │
                    ▼
          Get GPS coordinates every 5-10 sec
                    │
                    ▼
          PUT /user/{picker.uid}/location
          Body: { location: {lat, lng, address} }
                    │
                    ▼
          Backend updates user.location in DB
                    │
                    ▼
          Sender/Receiver polling detects change
                    │
                    ▼
          Map updates with new position
```

---

## Структура компонентов (Component Structure)

```
TrackingPage
│
├── State Management
│   ├── delivery (from API)
│   ├── pickerLocation (from polling)
│   ├── route (calculated via OSRM)
│   ├── loading
│   └── error
│
├── Effects
│   ├── Load delivery data (on mount)
│   ├── Polling timer (every 10s)
│   └── Route calculation (when pickerLocation changes)
│
├── UI Components
│   │
│   ├── MapContainer (Leaflet)
│   │   │
│   │   ├── TileLayer (OpenStreetMap)
│   │   │
│   │   ├── Marker (From - Green)
│   │   │   └── Popup (Address)
│   │   │
│   │   ├── Marker (To - Red)
│   │   │   └── Popup (Address)
│   │   │
│   │   ├── Marker (Picker - Blue)
│   │   │   └── Popup
│   │   │       ├── Avatar
│   │   │       ├── Name
│   │   │       ├── Rating
│   │   │       ├── Phone
│   │   │       └── Completed deliveries
│   │   │
│   │   └── Polyline (Route)
│   │
│   └── InfoPanel (Paper)
│       ├── Title
│       ├── Description
│       ├── Status Chip
│       ├── Distance Chip
│       ├── ETA Chip
│       └── Picker Info Chip
│
└── Helper Functions
    ├── calculateRoute()
    ├── getAddressFromCoordinates() (optional)
    └── formatDistance()
```

---

## API Endpoints Reference

### Frontend → Backend

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/delivery/requests/:id` | GET | Получить детали доставки | Delivery object |
| `/user/:uid` | GET | Получить данные пользователя (включая location) | User object |
| `/user/:uid/location` | PUT | Обновить местоположение picker'а | Updated user |
| `/traking/:deliveryId` | GET | Получить tracking info | Traking object |

### Frontend → External Services

| Service | Purpose | Input | Output |
|---------|---------|-------|--------|
| OSRM API | Построение маршрута | From coords, To coords | Route geometry, distance, duration |
| Nominatim API | Reverse geocoding | lat, lng | Address, city, country |

---

## Database Schema (Relevant Tables)

### deliveries

```sql
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id),
  picker_id INT REFERENCES users(id),
  recipient_id INT REFERENCES users(id),

  from_location JSONB,  -- {lat, lng, address, city, placeId}
  to_location JSONB,    -- {lat, lng, address, city, placeId}

  status VARCHAR(20),   -- pending, accepted, picked_up, delivered, cancelled
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(10),     -- 'sender' | 'picker'

  location JSONB,       -- {lat, lng, address?, city?, placeId?}
                        -- ^^^ ТЕКУЩАЯ ПОЗИЦИЯ ПИКЕРА

  is_online BOOLEAN,
  rating DECIMAL(3,2),
  completed_deliveries INT,
  avatar_url TEXT,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**ВАЖНО**: `user.location` хранит **текущее** местоположение пикера и обновляется в реальном времени через Geolocation API.

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Component State                          │
└─────────────────────────────────────────────────────────────┘

Initial State:
├── delivery: null
├── pickerLocation: null
├── route: null
├── loading: true
└── error: ''

    │
    │ useEffect (on mount)
    ▼

After API calls:
├── delivery: {
│     id, title, status,
│     fromLocation, toLocation,
│     picker: {uid, name, rating, phone, avatarUrl}
│   }
├── pickerLocation: {lat, lng, address}
├── route: null
└── loading: false

    │
    │ useEffect (calculate route)
    ▼

After route calculation:
├── delivery: {...}
├── pickerLocation: {lat, lng, address}
├── route: {
│     distance: "12.5 km",
│     duration: "25 min",
│     coordinates: [[lat, lng], [lat, lng], ...]
│   }
└── loading: false

    │
    │ Polling (every 10s)
    ▼

After picker moves:
├── pickerLocation: {lat: NEW_LAT, lng: NEW_LNG, address}
│                    ^^^^^^^^^ Updated position
└── route: {
      distance: "11.2 km",  ◄─── Recalculated
      duration: "22 min",
      coordinates: [...]     ◄─── New route
    }

    │
    │ Map re-renders
    ▼

Visual update:
├── Blue marker moves to new position
├── Polyline updates to show new route
└── Distance/ETA chips update
```

---

## Security & Authorization

### Кто может видеть tracking страницу?

```
/tracking/[deliveryId]

Allowed users:
├── Sender (delivery.senderId === currentUser.id)
├── Picker (delivery.pickerId === currentUser.id)
└── Receiver (delivery.recipientId === currentUser.id)

Denied:
└── All other users → Redirect to home
```

### Реализация проверки доступа

```typescript
// В TrackingPage.tsx
useEffect(() => {
  const checkAccess = async () => {
    const currentUser = await getCurrentUser(); // Firebase Auth
    const delivery = await getDeliveryRequestById(deliveryId);

    const hasAccess =
      delivery.sender.id === currentUser.id ||
      delivery.picker?.id === currentUser.id ||
      delivery.recipient?.id === currentUser.id;

    if (!hasAccess) {
      router.push('/403'); // Forbidden
    }
  };

  checkAccess();
}, [deliveryId]);
```

---

## Performance Optimizations

### 1. Polling Strategy

```typescript
// Adaptive polling - увеличить частоту при активной доставке
const getPollingInterval = (status: string) => {
  switch (status) {
    case 'picked_up': return 5000;   // 5 секунд - активная доставка
    case 'accepted':  return 10000;  // 10 секунд - ожидание pickup
    case 'pending':   return 30000;  // 30 секунд - ожидание accept
    default:          return 60000;  // 1 минута - завершено/отменено
  }
};
```

### 2. Route Caching

```typescript
// Кешировать маршрут, чтобы не пересчитывать при малых изменениях
const shouldRecalculateRoute = (oldPos, newPos) => {
  const distance = calculateDistance(oldPos, newPos);
  return distance > 0.1; // Пересчитать только если > 100 метров
};
```

### 3. Geolocation Battery Optimization

```typescript
// Регулировать точность в зависимости от скорости
const getLocationOptions = (speed: number) => {
  return {
    enableHighAccuracy: speed > 10, // Только при движении
    maximumAge: speed > 10 ? 1000 : 5000,
    timeout: 10000
  };
};
```

---

## Error Handling

### Возможные ошибки и решения

| Ошибка | Причина | Решение |
|--------|---------|---------|
| Map не загружается | SSR issue | Использовать `isMounted` state |
| Маркеры не видны | Неправильный формат координат | Проверить `[lat, lng]` порядок |
| OSRM timeout | Сервер перегружен | Fallback на прямую линию |
| Geolocation denied | Нет разрешений | Показать alert с инструкциями |
| Picker location null | Picker еще не начал движение | Показать "Waiting for pickup" |
| 403 Forbidden | Пользователь не имеет доступа | Redirect на home |

### Пример обработки ошибок

```typescript
const calculateRoute = async (from, to) => {
  try {
    const response = await fetch(OSRM_URL);
    if (!response.ok) throw new Error('OSRM API error');
    const data = await response.json();

    if (data.code !== 'Ok') {
      // Fallback на прямую линию
      return {
        coordinates: [[from.lat, from.lng], [to.lat, to.lng]],
        distance: 'N/A',
        duration: 'N/A'
      };
    }

    return parseOSRMResponse(data);
  } catch (error) {
    console.error('Route calculation failed:', error);
    setError('Could not calculate route. Showing direct line.');
    return null;
  }
};
```

---

## Future Enhancements

### Phase 1 (MVP) ✅
- [x] Базовая карта с маркерами
- [x] Polling для обновления позиции
- [x] OSRM маршрутизация
- [x] Информационная панель

### Phase 2 (v1.1)
- [ ] WebSocket для real-time обновлений (вместо polling)
- [ ] Анимация плавного перемещения маркера
- [ ] История перемещений picker'а (траектория)
- [ ] Push notifications при приближении к точке доставки

### Phase 3 (v1.2)
- [ ] Оптимизация батареи (adaptive location tracking)
- [ ] Offline support (PWA caching)
- [ ] Альтернативные маршруты
- [ ] Estimated arrival window (не точное ETA, а диапазон)

### Phase 4 (v2.0)
- [ ] Собственный OSRM сервер (для production)
- [ ] Machine Learning для предсказания ETA
- [ ] Traffic integration (пробки)
- [ ] Multi-stop deliveries (несколько точек доставки)

---

## Testing Checklist

### Frontend Tests
- [ ] Карта корректно рендерится на desktop
- [ ] Карта корректно рендерится на mobile
- [ ] Маркеры отображаются в правильных позициях
- [ ] Popup открывается при клике на picker marker
- [ ] Polyline обновляется при изменении позиции
- [ ] Distance и ETA обновляются
- [ ] Error states отображаются корректно
- [ ] Loading states работают

### Backend Tests
- [ ] GET /delivery/requests/:id возвращает все нужные данные
- [ ] GET /user/:uid возвращает location
- [ ] PUT /user/:uid/location обновляет location в БД
- [ ] Только авторизованные пользователи могут видеть tracking
- [ ] Только picker может обновлять свою location

### Integration Tests
- [ ] Polling обновляет pickerLocation каждые 10 сек
- [ ] OSRM API возвращает валидный маршрут
- [ ] Fallback работает при ошибке OSRM
- [ ] Geolocation обновляет location на сервере
- [ ] Sender видит обновления в реальном времени

### Mobile Tests
- [ ] Geolocation работает на Android
- [ ] Battery consumption в пределах нормы
- [ ] Location updates работают в фоне
- [ ] Останавливается при delivered/cancelled

---

**Версия документа**: 1.0
**Дата**: 2025-10-25
**Автор**: Claude AI

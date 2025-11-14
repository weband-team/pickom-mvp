# Контекст для реализации страницы отслеживания доставки (Delivery Tracking Page)

## Обзор проекта

Проект Pickom использует:
- **Frontend**: Next.js 15 + React 19 + TypeScript + Material-UI
- **Карты**: Leaflet 1.9.4 + react-leaflet 5.0.0 + OpenStreetMap tiles
- **Маршрутизация**: OSRM API (Open Source Routing Machine) для построения маршрутов
- **Backend**: NestJS + PostgreSQL + TypeORM
- **Авторизация**: Firebase Authentication

## Цель страницы

Создать страницу отслеживания доставки в реальном времени, где:
1. **Sender** (отправитель) и **Receiver** (получатель) могут видеть:
   - Текущее местоположение **picker'а** (курьера) на карте
   - Маршрут от текущей позиции picker'а до точки доставки
   - Информацию о доставке и picker'е
   - Статус доставки

2. Карта показывает:
   - **Зеленый маркер** - точка получения посылки (откуда)
   - **Красный маркер** - точка доставки (куда)
   - **Синий маркер (анимированный)** - текущая позиция picker'а
   - **Синяя линия** - маршрут от текущей позиции picker'а до точки доставки
   - Информация при клике на маркер picker'а (имя, рейтинг, телефон)

---

## Существующая структура данных

### 1. Location Interface (используется повсеместно)

```typescript
// Определено в: pickom-client/app/api/delivery.ts
interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  country?: string;
  placeId?: string;
}
```

### 2. Delivery Entity (Backend)

**Файл**: `pickom-server/src/delivery/entities/delivery.entity.ts`

```typescript
interface Delivery {
  id: number;
  senderId: number;
  pickerId: number | null;           // ID курьера
  recipientId: number | null;        // ID получателя
  recipientPhone: string | null;
  recipientConfirmed: boolean;

  // Локации хранятся в JSONB полях
  fromLocation: {                    // Откуда забрать
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;

  toLocation: {                      // Куда доставить
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;

  deliveryType: 'within-city' | 'inter-city';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight: number | null;

  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  title: string;
  description: string | null;
  deliveryDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  sender: User;
  picker: User;
  recipient: User;
}
```

### 3. User Entity (Backend)

**Файл**: `pickom-server/src/user/entities/user.entity.ts`

```typescript
interface User {
  id: number;
  uid: string;                      // Firebase UID
  email: string;
  name: string;
  phone: string;
  role: 'sender' | 'picker';
  avatarUrl: string;
  rating: number;                   // Рейтинг 0.00-5.00
  totalRatings: number;
  balance: number;
  isOnline: boolean;                // Статус онлайн
  basePrice: number;
  completedDeliveries: number;
  about: string;

  // ТЕКУЩЕЕ МЕСТОПОЛОЖЕНИЕ ПИКЕРА (JSONB)
  location: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    placeId?: string;
  } | null;

  createdAt: Date;
  updatedAt: Date;
}
```

**ВАЖНО**: Поле `location` в таблице `users` содержит **текущее местоположение picker'а** и должно обновляться в реальном времени, когда picker движется.

### 4. Tracking (Backend)

**Файл**: `pickom-server/src/traking/entities/traking.entity.ts`

```typescript
interface Traking {
  id: number;
  deliveryId: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
}
```

---

## Существующие API Endpoints

### Delivery API

**Базовый URL**: `http://localhost:3000`

```typescript
// Получить детали доставки (включает sender, picker, recipient, локации)
GET /delivery/requests/:id
Response: {
  id: number;
  senderId: number;
  pickerId: number | null;
  recipientId: number | null;
  fromLocation: Location;
  toLocation: Location;
  status: string;
  title: string;
  description: string;
  price: number;
  size: string;
  sender: User;
  picker: User;
  recipient: User;
  // ... остальные поля
}
```

### Tracking API

**Файл**: `pickom-server/src/traking/traking.controller.ts`

```typescript
// Получить информацию о tracking для доставки
GET /traking/:deliveryId
Headers: { Authorization: "Bearer <firebase-token>" }
Response: {
  id: number;
  deliveryId: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
}

// Обновить статус (только для picker)
PUT /traking/:deliveryId
Headers: { Authorization: "Bearer <firebase-token>" }
Body: { status: 'picked_up' | 'delivered' | etc }
Response: Traking
```

### User API

```typescript
// Получить данные пользователя по UID (включая текущее местоположение)
GET /user/:uid
Response: User (со всеми полями, включая location)

// Обновить местоположение picker'а (НУЖНО БУДЕТ РЕАЛИЗОВАТЬ)
PUT /user/:uid/location
Body: {
  location: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
  }
}
```

---

## Существующие компоненты карт

### 1. LocationPicker

**Файл**: `pickom-client/components/LocationPicker.tsx`

**Функционал**:
- Показывает одну точку на карте
- Клик по карте = выбор локации
- Кнопка "My Location" для получения текущих координат через Geolocation API
- OpenStreetMap tiles
- Один маркер (синий по умолчанию)

**Использование**:
```tsx
<LocationPicker
  onLocationSelect={(lat, lng) => {}}
  initialPosition={{ lat: 52.2297, lng: 21.0122 }}
/>
```

### 2. DualLocationPicker

**Файл**: `pickom-client/components/DualLocationPicker.tsx`

**Функционал**:
- Показывает две точки: From (зеленый) и To (красный)
- Переключение между маркерами через ToggleButton
- **Построение маршрута через OSRM API**
- Отображение расстояния и времени в пути
- Reverse geocoding через Nominatim (OpenStreetMap)
- Ограничения по городу/стране (для within-city / inter-city)
- Polyline для отображения маршрута

**Ключевые методы**:

```typescript
// Построение маршрута через OSRM
const calculateRoute = async (from: LocationData, to: LocationData) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  const data = await response.json();

  // Преобразование координат OSRM [lng, lat] -> [lat, lng]
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    (coord: number[]) => [coord[1], coord[0]]
  );

  return {
    distance: `${(route.distance / 1000).toFixed(1)} km`,
    duration: `${Math.round(route.duration / 60)} min`,
    coordinates
  };
}

// Reverse geocoding через Nominatim
const getAddressFromCoordinates = async (lat: number, lng: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await response.json();

  return {
    address: data.display_name,
    city: data.address?.city || data.address?.town,
    country: data.address?.country
  };
}
```

**Использование**:
```tsx
<DualLocationPicker
  onFromLocationSelect={(location) => {}}
  onToLocationSelect={(location) => {}}
  initialFromLocation={fromLoc}
  initialToLocation={toLoc}
  onRouteCalculated={(routeInfo) => {}}
  deliveryType="within-city"
/>
```

---

## Компоненты Leaflet (react-leaflet)

### Основные импорты

```typescript
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
```

### MapContainer

```tsx
<MapContainer
  center={[lat, lng]}
  zoom={13}
  style={{ height: '500px', width: '100%', borderRadius: '8px', zIndex: 0 }}
  scrollWheelZoom={true}
  attributionControl={false}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {/* Маркеры и другие элементы */}
</MapContainer>
```

### TileLayer (OpenStreetMap)

```tsx
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

### Marker (маркеры с кастомными иконками)

```typescript
// Создание кастомной иконки
const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Использование
<Marker position={[lat, lng]} icon={pickerIcon}>
  <Popup>
    <div>
      <h3>{picker.name}</h3>
      <p>Rating: {picker.rating} ⭐</p>
      <p>Phone: {picker.phone}</p>
    </div>
  </Popup>
</Marker>
```

**Доступные цвета маркеров** (из leaflet-color-markers):
- Blue (синий) - для picker'а
- Green (зеленый) - для точки отправления
- Red (красный) - для точки доставки
- Orange, Yellow, Violet, Grey, Black

### Polyline (линия маршрута)

```tsx
<Polyline
  positions={routeCoordinates}  // [[lat, lng], [lat, lng], ...]
  color="#2563eb"               // Синий цвет
  weight={4}                    // Толщина линии
  opacity={0.8}                 // Прозрачность
/>
```

### useMap Hook (для программного управления картой)

```typescript
import { useMap } from 'react-leaflet';

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}
```

### useMapEvents Hook (для обработки событий карты)

```typescript
import { useMapEvents } from 'react-leaflet';

function MapClickHandler() {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log('Clicked at:', lat, lng);
    },
    moveend(e) {
      console.log('Map moved');
    }
  });

  return null;
}
```

---

## Рекомендуемая архитектура страницы отслеживания

### Маршрут страницы

```
/tracking/[deliveryId]
```

**Файл**: `pickom-client/app/tracking/[deliveryId]/page.tsx`

### Компоненты

```
TrackingPage (основная страница)
├── TrackingMap (компонент карты)
│   ├── MapContainer
│   ├── TileLayer (OpenStreetMap)
│   ├── Marker (From - зеленый)
│   ├── Marker (To - красный)
│   ├── Marker (Picker - синий с Popup)
│   ├── Polyline (маршрут от picker до To)
│   └── MapController (автоцентрирование)
├── DeliveryInfoPanel (информация о доставке)
│   ├── DeliveryStatus
│   ├── RouteInfo (расстояние, время)
│   └── PickerCard (информация о курьере)
└── ChatButton (переход в чат)
```

### Структура данных для страницы

```typescript
interface TrackingPageData {
  delivery: {
    id: number;
    title: string;
    description: string;
    status: DeliveryStatus;
    fromLocation: Location;
    toLocation: Location;
    sender: User;
    picker: User;
    recipient: User;
  };
  pickerLocation: Location;         // Текущая позиция picker'а
  route: {
    distance: string;               // "12.5 km"
    duration: string;               // "25 min"
    coordinates: [number, number][]; // Координаты маршрута
  } | null;
}
```

### Логика обновления местоположения picker'а

**Real-time подходы**:

1. **Polling** (простой вариант для MVP):
   ```typescript
   useEffect(() => {
     const interval = setInterval(async () => {
       const pickerData = await fetch(`/api/user/${pickerId}`);
       const updatedLocation = pickerData.location;
       setPickerLocation(updatedLocation);

       // Пересчитать маршрут от новой позиции до toLocation
       if (updatedLocation && toLocation) {
         const newRoute = await calculateRoute(updatedLocation, toLocation);
         setRoute(newRoute);
       }
     }, 10000); // Обновление каждые 10 секунд

     return () => clearInterval(interval);
   }, [pickerId, toLocation]);
   ```

2. **WebSocket / SSE** (для production):
   - Backend эмитит событие при обновлении `user.location`
   - Frontend подписывается на события для конкретного `deliveryId`

### Пример кода страницы

```typescript
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Paper, Typography, Avatar, Chip } from '@mui/material';
import { useParams } from 'next/navigation';
import { getDeliveryRequestById } from '@/app/api/delivery';
import { getUserByUid } from '@/app/api/user';

const fromIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const toIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function TrackingPage() {
  const params = useParams();
  const deliveryId = params.deliveryId as string;

  const [delivery, setDelivery] = useState(null);
  const [pickerLocation, setPickerLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных доставки
  useEffect(() => {
    const loadDelivery = async () => {
      const data = await getDeliveryRequestById(Number(deliveryId));
      setDelivery(data);
      setLoading(false);
    };
    loadDelivery();
  }, [deliveryId]);

  // Обновление местоположения picker'а (polling)
  useEffect(() => {
    if (!delivery?.picker?.uid) return;

    const updatePickerLocation = async () => {
      const pickerData = await getUserByUid(delivery.picker.uid);
      setPickerLocation(pickerData.location);

      // Пересчитать маршрут
      if (pickerData.location && delivery.toLocation) {
        const newRoute = await calculateRoute(
          pickerData.location,
          delivery.toLocation
        );
        setRoute(newRoute);
      }
    };

    updatePickerLocation(); // Первичная загрузка
    const interval = setInterval(updatePickerLocation, 10000); // Каждые 10 сек

    return () => clearInterval(interval);
  }, [delivery]);

  const calculateRoute = async (from, to) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok') return null;

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(
        (coord) => [coord[1], coord[0]]
      );

      return {
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(route.duration / 60)} min`,
        coordinates
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!delivery) return <div>Delivery not found</div>;

  return (
    <Box sx={{ p: 2 }}>
      <MapContainer
        center={[
          delivery.toLocation.lat,
          delivery.toLocation.lng
        ]}
        zoom={13}
        style={{ height: '60vh', borderRadius: '12px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* From marker */}
        <Marker
          position={[delivery.fromLocation.lat, delivery.fromLocation.lng]}
          icon={fromIcon}
        >
          <Popup>
            <Typography variant="caption" fontWeight={600}>
              Pickup Location
            </Typography>
            <Typography variant="caption" display="block">
              {delivery.fromLocation.address}
            </Typography>
          </Popup>
        </Marker>

        {/* To marker */}
        <Marker
          position={[delivery.toLocation.lat, delivery.toLocation.lng]}
          icon={toIcon}
        >
          <Popup>
            <Typography variant="caption" fontWeight={600}>
              Delivery Location
            </Typography>
            <Typography variant="caption" display="block">
              {delivery.toLocation.address}
            </Typography>
          </Popup>
        </Marker>

        {/* Picker marker */}
        {pickerLocation && (
          <Marker
            position={[pickerLocation.lat, pickerLocation.lng]}
            icon={pickerIcon}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Avatar src={delivery.picker.avatarUrl} sx={{ mb: 1 }} />
                <Typography variant="subtitle2">{delivery.picker.name}</Typography>
                <Typography variant="caption" display="block">
                  Rating: {delivery.picker.rating} ⭐
                </Typography>
                <Typography variant="caption" display="block">
                  Phone: {delivery.picker.phone}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {route?.coordinates && (
          <Polyline
            positions={route.coordinates}
            color="#2563eb"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>

      {/* Информация о доставке */}
      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6">{delivery.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {delivery.status}
        </Typography>
        {route && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label={`Distance: ${route.distance}`} size="small" />
            <Chip label={`ETA: ${route.duration}`} size="small" />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
```

---

## Дополнительные функции

### 1. Анимация перемещения маркера picker'а

```typescript
import { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet';

function AnimatedPickerMarker({ position, icon }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current;
      // Плавная анимация перехода к новой позиции
      marker.setLatLng(position, { animate: true, duration: 1 });
    }
  }, [position]);

  return <Marker ref={markerRef} position={position} icon={icon} />;
}
```

### 2. Автоматическое центрирование карты

```typescript
import { useMap } from 'react-leaflet';

function MapBoundsController({ fromLocation, toLocation, pickerLocation }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([
      [fromLocation.lat, fromLocation.lng],
      [toLocation.lat, toLocation.lng],
      ...(pickerLocation ? [[pickerLocation.lat, pickerLocation.lng]] : [])
    ]);

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [fromLocation, toLocation, pickerLocation, map]);

  return null;
}

// Использование внутри MapContainer
<MapBoundsController
  fromLocation={delivery.fromLocation}
  toLocation={delivery.toLocation}
  pickerLocation={pickerLocation}
/>
```

### 3. Отображение статуса доставки с цветовой индикацией

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'accepted': return 'info';
    case 'picked_up': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

<Chip
  label={delivery.status.toUpperCase()}
  color={getStatusColor(delivery.status)}
  size="medium"
/>
```

### 4. Обновление местоположения picker'а (Backend)

Нужно добавить эндпоинт для обновления `user.location`:

**Файл**: `pickom-server/src/user/user.controller.ts`

```typescript
@Put(':uid/location')
@UseGuards(FirebaseAuthGuard)
async updateLocation(
  @Param('uid') uid: string,
  @Body() locationDto: { location: { lat: number; lng: number; address?: string } },
  @Req() req: ReqWithUser,
) {
  // Проверка, что пользователь обновляет свою локацию
  if (req.user.uid !== uid) {
    throw new ForbiddenException('You can only update your own location');
  }

  return await this.userService.updateLocation(uid, locationDto.location);
}
```

**В UserService**:
```typescript
async updateLocation(uid: string, location: any) {
  return await this.userRepository.update(
    { uid },
    { location }
  );
}
```

---

## Проверка доступа (Authorization)

Только **sender**, **receiver** и **picker** конкретной доставки могут видеть страницу tracking:

```typescript
// Проверка на frontend
useEffect(() => {
  const checkAccess = async () => {
    const currentUser = await getCurrentUser(); // из Firebase Auth
    const delivery = await getDeliveryRequestById(deliveryId);

    const hasAccess =
      delivery.sender.uid === currentUser.uid ||
      delivery.picker?.uid === currentUser.uid ||
      delivery.recipient?.uid === currentUser.uid;

    if (!hasAccess) {
      router.push('/'); // Редирект если нет доступа
    }
  };

  checkAccess();
}, [deliveryId]);
```

---

## API клиент (Frontend)

**Файл**: `pickom-client/app/api/tracking.ts`

```typescript
import axios from './axios';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  country?: string;
  placeId?: string;
}

export interface TrackingInfo {
  id: number;
  deliveryId: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export async function getTracking(deliveryId: number): Promise<TrackingInfo> {
  const response = await axios.get(`/traking/${deliveryId}`);
  return response.data;
}

export async function updateTrackingStatus(
  deliveryId: number,
  status: string
): Promise<TrackingInfo> {
  const response = await axios.put(`/traking/${deliveryId}`, { status });
  return response.data;
}

// Для получения текущей локации picker'а
export async function getPickerLocation(uid: string): Promise<Location | null> {
  const response = await axios.get(`/user/${uid}`);
  return response.data.location;
}

// Для обновления локации picker'а (вызывается с мобильного устройства picker'а)
export async function updatePickerLocation(uid: string, location: Location): Promise<void> {
  await axios.put(`/user/${uid}/location`, { location });
}
```

---

## Capacitor Geolocation (для picker mobile app)

Для автоматического обновления местоположения picker'а в реальном времени:

**Установка плагина** (если еще не установлен):
```bash
npm install @capacitor/geolocation
npx cap sync
```

**Код для tracker'а локации (в приложении picker'а)**:

```typescript
import { Geolocation } from '@capacitor/geolocation';

// Запуск отслеживания местоположения
const startLocationTracking = async (pickerUid: string) => {
  const watchId = await Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    },
    async (position, err) => {
      if (err) {
        console.error('Geolocation error:', err);
        return;
      }

      if (position) {
        const { latitude, longitude } = position.coords;

        // Отправить новую позицию на сервер
        await updatePickerLocation(pickerUid, {
          lat: latitude,
          lng: longitude,
          address: '' // Можно добавить reverse geocoding
        });
      }
    }
  );

  return watchId;
};

// Остановка отслеживания
const stopLocationTracking = async (watchId: string) => {
  await Geolocation.clearWatch({ id: watchId });
};
```

**Интеграция в страницу активной доставки picker'а**:

```typescript
// В pickom-client/app/active-delivery/[id]/page.tsx

useEffect(() => {
  if (delivery?.status === 'picked_up') {
    const watchId = startLocationTracking(currentUser.uid);

    return () => {
      stopLocationTracking(watchId);
    };
  }
}, [delivery?.status, currentUser.uid]);
```

---

## OSRM API Details

### Базовый запрос

```
GET https://router.project-osrm.org/route/v1/{profile}/{coordinates}
```

**Параметры**:
- `profile`: `driving`, `car`, `bike`, `foot` (обычно используется `driving`)
- `coordinates`: `{lng},{lat};{lng},{lat}` (список координат через `;`)

**Query параметры**:
- `overview=full` - возвращает все точки маршрута
- `geometries=geojson` - формат геометрии (GeoJSON)
- `steps=true` - пошаговые инструкции
- `alternatives=true` - альтернативные маршруты

### Пример запроса

```
https://router.project-osrm.org/route/v1/driving/21.0122,52.2297;21.0456,52.2345?overview=full&geometries=geojson
```

### Пример ответа

```json
{
  "code": "Ok",
  "routes": [
    {
      "geometry": {
        "coordinates": [
          [21.0122, 52.2297],
          [21.0130, 52.2300],
          [21.0456, 52.2345]
        ],
        "type": "LineString"
      },
      "distance": 2500.5,  // в метрах
      "duration": 300.2    // в секундах
    }
  ],
  "waypoints": [...]
}
```

**ВАЖНО**: OSRM возвращает координаты в формате `[lng, lat]`, а Leaflet ожидает `[lat, lng]`, поэтому нужна конвертация!

```typescript
const coordinates = route.geometry.coordinates.map(
  (coord: number[]) => [coord[1], coord[0]]  // [lng, lat] -> [lat, lng]
);
```

---

## Nominatim API (Reverse Geocoding)

### Базовый запрос

```
GET https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}
```

**Параметры**:
- `format=json` - формат ответа
- `lat={lat}` - широта
- `lon={lng}` - долгота
- `zoom=18` - уровень детализации (1-18, где 18 = самый детальный)
- `addressdetails=1` - включить детали адреса

**Headers** (ВАЖНО):
```javascript
{
  'Accept-Language': 'en'  // Язык ответа
}
```

### Пример ответа

```json
{
  "display_name": "Warsaw, Poland",
  "address": {
    "road": "Marszałkowska",
    "city": "Warsaw",
    "state": "Masovian Voivodeship",
    "country": "Poland",
    "country_code": "pl"
  },
  "lat": "52.2297",
  "lon": "21.0122"
}
```

---

## Тестирование

### Mock данные для локальной разработки

```typescript
const MOCK_PICKER_LOCATION = {
  lat: 52.2320,  // Немного смещено от toLocation
  lng: 21.0150,
  address: 'Somewhere in Warsaw'
};

// Симуляция движения picker'а (для тестирования)
const simulatePickerMovement = () => {
  const [currentLat, setCurrentLat] = useState(52.2320);
  const [currentLng, setCurrentLng] = useState(52.2150);

  useEffect(() => {
    const interval = setInterval(() => {
      // Двигаться в сторону toLocation на 0.001 градуса
      setCurrentLat(prev => prev + 0.001);
      setCurrentLng(prev => prev + 0.001);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { lat: currentLat, lng: currentLng };
};
```

---

## Чеклист реализации

### Backend

- [ ] Добавить endpoint `PUT /user/:uid/location` для обновления местоположения
- [ ] Убедиться, что `user.location` возвращается в `GET /delivery/requests/:id`
- [ ] (Опционально) Добавить WebSocket для real-time обновлений

### Frontend

- [ ] Создать страницу `/tracking/[deliveryId]/page.tsx`
- [ ] Создать компонент `TrackingMap` с:
  - [ ] От-маркером (зеленый)
  - [ ] К-маркером (красный)
  - [ ] Picker-маркером (синий с Popup)
  - [ ] Polyline для маршрута
  - [ ] Auto-centering/bounds
- [ ] Добавить polling для обновления `pickerLocation` каждые 10 сек
- [ ] Интегрировать OSRM для построения маршрута от picker до toLocation
- [ ] Добавить панель с информацией о доставке
- [ ] Добавить проверку доступа (только sender, picker, receiver)

### Picker Mobile App

- [ ] Добавить Capacitor Geolocation tracking в `/active-delivery/[id]`
- [ ] Автоматически обновлять `user.location` при движении
- [ ] Запускать tracking только при статусе `picked_up`
- [ ] Останавливать tracking при `delivered` или `cancelled`

### UI/UX

- [ ] Добавить индикатор обновления ("Updating location...")
- [ ] Показывать расстояние и ETA
- [ ] Анимация перемещения picker маркера
- [ ] Responsive дизайн (особенно для мобильных)
- [ ] Loading states
- [ ] Error handling (нет доступа, нет GPS, и т.д.)

---

## Дополнительные ресурсы

### Документация

- **Leaflet**: https://leafletjs.com/reference.html
- **React-Leaflet**: https://react-leaflet.js.org/docs/start-introduction/
- **OSRM API**: https://project-osrm.org/docs/v5.24.0/api/
- **Nominatim API**: https://nominatim.org/release-docs/develop/api/Reverse/
- **Capacitor Geolocation**: https://capacitorjs.com/docs/apis/geolocation

### CDN ресурсы

```html
<!-- Leaflet CSS (уже импортируется в компонентах) -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- Иконки маркеров -->
https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-{color}.png
Доступные цвета: blue, red, green, orange, yellow, violet, grey, black
```

### Примеры координат (Минск, Беларусь)

```typescript
const MINSK_CENTER = { lat: 53.9006, lng: 27.5590 };
const MINSK_TRAIN_STATION = { lat: 53.8910, lng: 27.5510 };
const MINSK_AIRPORT = { lat: 53.8825, lng: 28.0307 };
```

---

## Примечания

1. **Rate Limiting**: Nominatim имеет ограничение 1 запрос/сек. Для production рассмотреть:
   - Собственный Nominatim сервер
   - Альтернативные сервисы (Mapbox, Google Geocoding API)

2. **OSRM Self-hosted**: Для больших нагрузок рассмотреть развертывание собственного OSRM сервера.

3. **Battery Optimization**: Geolocation tracking потребляет много батареи. Рекомендации:
   - Использовать `maximumAge` для кеширования позиций
   - Регулировать частоту обновлений в зависимости от скорости движения
   - Останавливать tracking при остановке

4. **Fallback для маршрута**: Если OSRM не может построить маршрут, показывать прямую линию между точками.

5. **Mobile First**: Страница должна быть полностью функциональной на мобильных устройствах (touch events, responsive layout).

---

## Архитектура данных

```
┌─────────────────────────────────────────────┐
│           Tracking Page (/tracking/[id])     │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌──────────────────┐
│   Delivery    │       │  Picker Location │
│   (Database)  │       │  (user.location) │
└───────────────┘       └──────────────────┘
        │                       │
        ├─ fromLocation         ├─ lat, lng
        ├─ toLocation           ├─ address
        ├─ status              └─ (updated via Geolocation)
        ├─ sender
        ├─ picker
        └─ recipient
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌──────────────────┐
│  OSRM API     │       │  Nominatim API   │
│  (Routing)    │       │  (Geocoding)     │
└───────────────┘       └──────────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌───────────────────────┐
        │  TrackingMap Component │
        │  (Leaflet + OSM tiles) │
        └───────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   [From Marker]           [To Marker]
   (Green)                 (Red)
                    │
                    ▼
              [Picker Marker]
              (Blue + Popup)
                    │
                    ▼
              [Route Polyline]
              (From Picker to To)
```

---

## Финальный результат

После реализации:

1. **Sender** открывает `/tracking/{deliveryId}` и видит:
   - Карту с маркерами From, To, Picker
   - Маршрут от picker'а до точки доставки
   - Расстояние и ETA
   - Информацию о picker'е
   - Текущий статус доставки

2. **Receiver** открывает `/tracking/{deliveryId}` и видит то же самое

3. **Picker** в приложении:
   - Его местоположение автоматически обновляется (через Capacitor Geolocation)
   - `user.location` в БД обновляется каждые N секунд
   - Sender и Receiver видят обновления на карте

4. Карта автоматически:
   - Пересчитывает маршрут при изменении позиции picker'а
   - Обновляет расстояние и время
   - Анимирует перемещение маркера

---

**Автор документа**: Claude AI
**Дата**: 2025-10-25
**Проект**: Pickom MVP
**Версия**: 1.0

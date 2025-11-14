# Quick Start: Tracking Page Implementation

## Краткий обзор

Страница `/tracking/[deliveryId]` показывает в реальном времени:
- 🟢 Зеленый маркер - точка получения посылки (from)
- 🔴 Красный маркер - точка доставки (to)
- 🔵 Синий маркер - текущая позиция picker'а (обновляется автоматически)
- 🛣️ Синяя линия - маршрут от picker'а до точки доставки
- ℹ️ Popup на маркере picker'а - информация о курьере

**Технологии**: Leaflet + OpenStreetMap + OSRM API + React-Leaflet

---

## Быстрый старт (5 шагов)

### 1. Backend: Добавить endpoint для обновления местоположения

**Файл**: `pickom-server/src/user/user.controller.ts`

```typescript
@Put(':uid/location')
@UseGuards(FirebaseAuthGuard)
async updateLocation(
  @Param('uid') uid: string,
  @Body() locationDto: { location: { lat: number; lng: number; address?: string } },
  @Req() req: ReqWithUser,
) {
  if (req.user.uid !== uid) {
    throw new ForbiddenException('You can only update your own location');
  }
  return await this.userService.updateLocation(uid, locationDto.location);
}
```

**В UserService**:
```typescript
async updateLocation(uid: string, location: any) {
  return await this.userRepository.update({ uid }, { location });
}
```

### 2. Frontend: Создать страницу tracking

**Файл**: `pickom-client/app/tracking/[deliveryId]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { useParams } from 'next/navigation';
import { getDeliveryRequestById } from '@/app/api/delivery';

// Иконки маркеров
const fromIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const toIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

export default function TrackingPage() {
  const params = useParams();
  const deliveryId = params.deliveryId as string;

  const [delivery, setDelivery] = useState<any>(null);
  const [pickerLocation, setPickerLocation] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Загрузка данных доставки
  useEffect(() => {
    const loadDelivery = async () => {
      try {
        const data = await getDeliveryRequestById(Number(deliveryId));
        setDelivery(data);

        // Если есть picker, загрузить его локацию
        if (data.picker) {
          const pickerData = await fetch(`/api/user/${data.picker.uid}`).then(r => r.json());
          setPickerLocation(pickerData.location);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading delivery:', error);
        setLoading(false);
      }
    };

    loadDelivery();
  }, [deliveryId]);

  // Polling для обновления местоположения picker'а
  useEffect(() => {
    if (!delivery?.picker) return;

    const updatePickerLocation = async () => {
      try {
        const response = await fetch(`/api/user/${delivery.picker.uid}`);
        const pickerData = await response.json();
        setPickerLocation(pickerData.location);

        // Пересчитать маршрут
        if (pickerData.location && delivery.toLocation) {
          const newRoute = await calculateRoute(pickerData.location, delivery.toLocation);
          setRoute(newRoute);
        }
      } catch (error) {
        console.error('Error updating picker location:', error);
      }
    };

    updatePickerLocation(); // Первичная загрузка
    const interval = setInterval(updatePickerLocation, 10000); // Каждые 10 сек

    return () => clearInterval(interval);
  }, [delivery]);

  // Построение маршрута через OSRM
  const calculateRoute = async (from: any, to: any) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        return null;
      }

      const route = data.routes[0];
      // ВАЖНО: OSRM возвращает [lng, lat], конвертируем в [lat, lng]
      const coordinates = route.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]]
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

  if (!isMounted) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading map...</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading delivery...</Typography>
      </Box>
    );
  }

  if (!delivery) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Delivery not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Карта */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[delivery.toLocation.lat, delivery.toLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* From marker (зеленый) */}
          <Marker
            position={[delivery.fromLocation.lat, delivery.fromLocation.lng]}
            icon={fromIcon}
          >
            <Popup>
              <Typography variant="caption" fontWeight={600}>Pickup Location</Typography>
              <Typography variant="caption" display="block">{delivery.fromLocation.address}</Typography>
            </Popup>
          </Marker>

          {/* To marker (красный) */}
          <Marker
            position={[delivery.toLocation.lat, delivery.toLocation.lng]}
            icon={toIcon}
          >
            <Popup>
              <Typography variant="caption" fontWeight={600}>Delivery Location</Typography>
              <Typography variant="caption" display="block">{delivery.toLocation.address}</Typography>
            </Popup>
          </Marker>

          {/* Picker marker (синий) */}
          {pickerLocation && (
            <Marker
              position={[pickerLocation.lat, pickerLocation.lng]}
              icon={pickerIcon}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{delivery.picker.name}</Typography>
                  <Typography variant="caption" display="block">
                    Rating: {delivery.picker.rating} ⭐
                  </Typography>
                  <Typography variant="caption" display="block">
                    Phone: {delivery.picker.phone}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {delivery.picker.completedDeliveries} completed deliveries
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
      </Box>

      {/* Информационная панель */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Typography variant="h6" gutterBottom>{delivery.title}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {delivery.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Chip
            label={delivery.status.toUpperCase()}
            color={
              delivery.status === 'delivered' ? 'success' :
              delivery.status === 'picked_up' ? 'primary' :
              delivery.status === 'accepted' ? 'info' : 'warning'
            }
            size="small"
          />

          {route && (
            <>
              <Chip label={`Distance: ${route.distance}`} size="small" variant="outlined" />
              <Chip label={`ETA: ${route.duration}`} size="small" variant="outlined" />
            </>
          )}

          {delivery.picker && (
            <Chip
              label={`Picker: ${delivery.picker.name}`}
              size="small"
              variant="outlined"
              avatar={
                delivery.picker.avatarUrl ?
                <img src={delivery.picker.avatarUrl} alt={delivery.picker.name} style={{ width: 24, height: 24, borderRadius: '50%' }} /> :
                undefined
              }
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
```

### 3. API клиент для tracking

**Файл**: `pickom-client/app/api/tracking.ts`

```typescript
import axios from './axios';

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

export async function updatePickerLocation(
  uid: string,
  location: { lat: number; lng: number; address?: string }
): Promise<void> {
  await axios.put(`/user/${uid}/location`, { location });
}
```

### 4. Picker: Автоматическое обновление местоположения

**Файл**: `pickom-client/app/active-delivery/[id]/page.tsx` (добавить в существующий код)

```typescript
import { Geolocation } from '@capacitor/geolocation';
import { updatePickerLocation } from '@/app/api/tracking';

// Добавить в компонент ActiveDeliveryPage
useEffect(() => {
  if (!delivery || delivery.status !== 'picked_up') return;
  if (!currentUser || currentUser.role !== 'picker') return;

  let watchId: string;

  const startTracking = async () => {
    try {
      watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        },
        async (position, err) => {
          if (err) {
            console.error('Geolocation error:', err);
            return;
          }

          if (position) {
            const { latitude, longitude } = position.coords;

            // Обновить на сервере
            await updatePickerLocation(currentUser.uid, {
              lat: latitude,
              lng: longitude,
              address: delivery.toLocation.address // или reverse geocode
            });
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  startTracking();

  return () => {
    if (watchId) {
      Geolocation.clearWatch({ id: watchId });
    }
  };
}, [delivery?.status, currentUser]);
```

### 5. Добавить ссылку на tracking в order details

**Файл**: `pickom-client/app/orders/[id]/page.tsx`

```typescript
import { useRouter } from 'next/navigation';

// В компоненте
const router = useRouter();

// Добавить кнопку
<Button
  variant="contained"
  fullWidth
  onClick={() => router.push(`/tracking/${orderId}`)}
  disabled={!order.picker || order.status === 'pending'}
>
  Track Delivery
</Button>
```

---

## Тестирование

### 1. Тест с mock данными (без Geolocation)

```typescript
// В TrackingPage, добавить для разработки:
const MOCK_PICKER_LOCATION = {
  lat: 53.9020, // Немного смещено от toLocation
  lng: 27.5600,
  address: 'Moving through Minsk'
};

// Симуляция движения
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    let lat = 53.9000;
    const interval = setInterval(() => {
      lat += 0.0005; // Двигаться на север
      setPickerLocation({ lat, lng: 27.5590, address: 'Moving...' });
    }, 3000);

    return () => clearInterval(interval);
  }
}, []);
```

### 2. Проверка API

```bash
# Получить delivery
curl http://localhost:3000/delivery/requests/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Обновить локацию picker'а
curl -X PUT http://localhost:3000/user/PICKER_UID/location \
  -H "Authorization: Bearer PICKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location": {"lat": 53.9006, "lng": 27.5590}}'

# Получить tracking
curl http://localhost:3000/traking/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Карта не загружается
- Проверить, что `isMounted` используется для SSR
- Проверить импорт CSS: `import 'leaflet/dist/leaflet.css'`
- Добавить `'use client'` в начало файла

### Маркеры не отображаются
- Проверить URL иконок (должны быть доступны)
- Проверить, что координаты в формате `[lat, lng]` (не `[lng, lat]`)

### OSRM не возвращает маршрут
- Проверить порядок координат: `${lng},${lat}` в URL
- Проверить, что координаты валидные
- Fallback на прямую линию:
```typescript
if (!route) {
  setRouteCoordinates([
    [from.lat, from.lng],
    [to.lat, to.lng]
  ]);
}
```

### Geolocation не работает
- Проверить разрешения в AndroidManifest.xml
- Запросить разрешения:
```typescript
const permission = await Geolocation.requestPermissions();
if (permission.location !== 'granted') {
  alert('Location permission required');
}
```

---

## Следующие шаги

1. ✅ Реализовать базовую страницу tracking с картой
2. ✅ Добавить polling для обновления местоположения
3. 🔄 Добавить WebSocket для real-time обновлений (опционально)
4. 🔄 Оптимизировать battery usage для Geolocation
5. 🔄 Добавить кеширование OSRM маршрутов
6. 🔄 Добавить анимацию перемещения маркера picker'а
7. 🔄 Реализовать уведомления при приближении к точке доставки

---

## Полезные ресурсы

- **Полная документация**: `TRACKING_PAGE_CONTEXT.md`
- **Leaflet docs**: https://leafletjs.com/
- **OSRM API**: https://project-osrm.org/docs/v5.24.0/api/
- **Capacitor Geolocation**: https://capacitorjs.com/docs/apis/geolocation

---

**Время реализации**: ~4-6 часов
**Сложность**: Средняя
**Приоритет**: Высокий (ключевая фича для MVP)

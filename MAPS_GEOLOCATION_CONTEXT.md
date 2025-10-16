# Maps & Geolocation Context - Pickom Project

## 🗺️ ЧТО ВАМ НУЖНО ДЛЯ ПОИСКА ПОЛЬЗОВАТЕЛЕЙ ПО ГЕОЛОКАЦИИ

### **Ваш Use Case:**
- Искать пользователей в радиусе X км от точки
- Показывать пользователей на карте
- Фильтровать по расстоянию
- Возможно: строить маршруты, показывать ближайших путешественников

---

## 🎯 КОМПЛЕКСНОЕ РЕШЕНИЕ

### **Frontend (Карты):**

#### 1. **Leaflet + OpenStreetMap** ⭐ (РЕКОМЕНДУЮ)
**Для чего:**
- Отображение карты
- Показ маркеров пользователей
- Выбор точки поиска
- Рисование радиуса поиска

**Преимущества:**
- ✅ Полностью бесплатно
- ✅ Можно показать множество маркеров (пользователей)
- ✅ Кластеризация маркеров (библиотека `react-leaflet-cluster`)
- ✅ Рисование кругов/радиусов
- ✅ Легковесная библиотека

**Установка:**
```bash
npm install leaflet react-leaflet
npm install react-leaflet-cluster  # для группировки маркеров
```

**Пример функционала:**
```typescript
// Показать пользователей в радиусе 5 км
<Circle
  center={[52.2297, 21.0122]}
  radius={5000}  // метры
  pathOptions={{ color: 'blue', fillOpacity: 0.1 }}
/>

// Маркеры пользователей
{users.map(user => (
  <Marker
    key={user.id}
    position={[user.location.lat, user.location.lng]}
  >
    <Popup>{user.name}</Popup>
  </Marker>
))}
```

---

#### 2. **Mapbox GL JS** 💰
**Для чего:**
- Более красивые карты
- Встроенная геолокация
- Лучшая производительность с большим количеством маркеров

**Ограничения:**
- ⚠️ Бесплатно: 50,000 загрузок карты/месяц
- ❌ После лимита - платно ($5 за 10,000 загрузок)

---

### **Backend (База данных + Геопространственные запросы):**

#### 1. **PostgreSQL + PostGIS** ⭐⭐⭐ (ЛУЧШИЙ ВАРИАНТ)

**Что это:**
- PostGIS - расширение PostgreSQL для геопространственных данных
- Уже используете PostgreSQL, так что идеально подходит!

**Возможности:**
- ✅ Поиск в радиусе (ST_DWithin)
- ✅ Расчет расстояния между точками (ST_Distance)
- ✅ Поиск ближайших N пользователей
- ✅ Геопространственные индексы (быстрый поиск)
- ✅ Полностью бесплатно

**Пример запросов:**
```sql
-- Найти всех пользователей в радиусе 5 км от точки
SELECT * FROM users
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  ST_SetSRID(ST_MakePoint(21.0122, 52.2297), 4326)::geography,
  5000  -- метры
);

-- Найти 10 ближайших пользователей
SELECT *,
  ST_Distance(
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(21.0122, 52.2297), 4326)::geography
  ) as distance
FROM users
ORDER BY distance
LIMIT 10;
```

---

## 📋 ПОЛНЫЙ ПЛАН РЕАЛИЗАЦИИ

### **АРХИТЕКТУРА РЕШЕНИЯ:**

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Leaflet)         │
│  - Карта с маркерами пользователей          │
│  - Выбор точки поиска (клик по карте)       │
│  - Ползунок радиуса поиска (1-50 км)        │
│  - Отображение результатов                   │
└─────────────────┬───────────────────────────┘
                  │ HTTP Request
                  │ GET /users/nearby?lat=52.23&lng=21.01&radius=5000
                  ▼
┌─────────────────────────────────────────────┐
│        Backend (NestJS + PostgreSQL)        │
│  - API endpoint для поиска                   │
│  - Геопространственные запросы (PostGIS)     │
│  - Фильтрация и сортировка                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│      PostgreSQL + PostGIS Extension         │
│  - Хранение координат (lat, lng)            │
│  - Геопространственные индексы               │
│  - Быстрый поиск по расстоянию              │
└─────────────────────────────────────────────┘
```

---

## 🔧 ДЕТАЛЬНЫЙ ПЛАН РЕАЛИЗАЦИИ

### **ЭТАП 1: Установка PostGIS (Backend)**

**1.1. Подключиться к PostgreSQL и установить расширение:**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**1.2. Проверить установку:**
```sql
SELECT PostGIS_Version();
```

---

### **ЭТАП 2: Обновление Entity (Backend)**

**Файл:** `pickom-server/src/user/entities/user.entity.ts`

**Изменения:**
```typescript
import { Entity, Column, Index } from 'typeorm';

@Entity('users')
export class User {
  // ... existing fields ...

  @Column({ type: 'jsonb', nullable: true })
  location: {
    lat: number;
    lng: number;
  };

  // Добавляем геопространственный столбец (автоматически генерируется)
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  geolocation: string; // PostGIS POINT
}
```

**1.3. Создать миграцию:**
```bash
cd pickom-server
npm run migration:generate -- src/migrations/AddGeolocationColumn
npm run migration:run
```

---

### **ЭТАП 3: Обновление User Service (Backend)**

**Файл:** `pickom-server/src/user/user.service.ts`

**3.1. Добавить метод для обновления geolocation при сохранении:**
```typescript
async updateUser(uid: string, updateData: UpdateUserDto) {
  // ... existing code ...

  // Если есть location, обновляем geolocation для PostGIS
  if (updateData.location && updateData.location.lat && updateData.location.lng) {
    const { lat, lng } = updateData.location;

    // Создаем POINT для PostGIS
    await this.userRepository.query(
      `UPDATE users SET geolocation = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE uid = $3`,
      [lng, lat, uid] // ВАЖНО: lng первый, потом lat!
    );
  }

  return this.userRepository.save(user);
}
```

**3.2. Добавить метод поиска пользователей поблизости:**
```typescript
async findNearby(lat: number, lng: number, radiusMeters: number = 5000) {
  const query = `
    SELECT
      uid,
      name,
      email,
      phone,
      "avatarUrl",
      location,
      ST_Distance(
        geolocation,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) as distance
    FROM users
    WHERE geolocation IS NOT NULL
      AND ST_DWithin(
        geolocation,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    ORDER BY distance
  `;

  const users = await this.userRepository.query(query, [lng, lat, radiusMeters]);

  return users.map(user => ({
    ...user,
    distance: Math.round(user.distance), // расстояние в метрах
  }));
}
```

---

### **ЭТАП 4: Создать API endpoint (Backend)**

**Файл:** `pickom-server/src/user/user.controller.ts`

```typescript
@Get('nearby')
@ApiOperation({ summary: 'Find users nearby a location' })
@ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
@ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
@ApiQuery({ name: 'radius', type: Number, description: 'Radius in meters (default: 5000)', required: false })
async findNearby(
  @Query('lat') lat: number,
  @Query('lng') lng: number,
  @Query('radius') radius: number = 5000,
) {
  return this.userService.findNearby(+lat, +lng, +radius);
}
```

**Тестовый запрос:**
```bash
GET http://localhost:4242/user/nearby?lat=52.2297&lng=21.0122&radius=5000
```

---

### **ЭТАП 5: Frontend - Установка библиотек**

```bash
cd pickom-client
npm install leaflet react-leaflet
npm install react-leaflet-cluster  # для кластеризации маркеров
npm install -D @types/leaflet
```

---

### **ЭТАП 6: Создать компонент карты поиска (Frontend)**

**Файл:** `pickom-client/app/components/UserMapSearch.tsx`

```typescript
'use client';

import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Box, Slider, Typography, Paper } from '@mui/material';
import 'leaflet/dist/leaflet.css';

interface User {
  uid: string;
  name: string;
  avatarUrl?: string;
  location: { lat: number; lng: number };
  distance: number;
}

interface Props {
  onSearch?: (users: User[]) => void;
}

export default function UserMapSearch({ onSearch }: Props) {
  const [center, setCenter] = useState({ lat: 52.2297, lng: 21.0122 });
  const [radius, setRadius] = useState(5000); // метры
  const [users, setUsers] = useState<User[]>([]);

  // Поиск пользователей
  const searchUsers = async (lat: number, lng: number, radiusMeters: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/user/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`
      );
      const data = await response.json();
      setUsers(data);
      onSearch?.(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Компонент для клика по карте
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setCenter({ lat, lng });
        searchUsers(lat, lng, radius);
      },
    });
    return null;
  }

  useEffect(() => {
    searchUsers(center.lat, center.lng, radius);
  }, [radius]);

  return (
    <Box>
      {/* Ползунок радиуса */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Радиус поиска: {(radius / 1000).toFixed(1)} км
        </Typography>
        <Slider
          value={radius}
          onChange={(_, value) => setRadius(value as number)}
          min={1000}
          max={50000}
          step={1000}
          marks={[
            { value: 1000, label: '1 км' },
            { value: 25000, label: '25 км' },
            { value: 50000, label: '50 км' },
          ]}
        />
        <Typography variant="caption" color="text.secondary">
          Найдено пользователей: {users.length}
        </Typography>
      </Paper>

      {/* Карта */}
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <MapClickHandler />

        {/* Круг радиуса поиска */}
        <Circle
          center={center}
          radius={radius}
          pathOptions={{ color: 'blue', fillOpacity: 0.1 }}
        />

        {/* Маркер центра поиска */}
        <Marker position={center}>
          <Popup>Точка поиска</Popup>
        </Marker>

        {/* Маркеры пользователей */}
        {users.map((user) => (
          <Marker
            key={user.uid}
            position={[user.location.lat, user.location.lng]}
          >
            <Popup>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2">{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(user.distance / 1000).toFixed(1)} км
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
```

---

### **ЭТАП 7: Создать страницу поиска (Frontend)**

**Файл:** `pickom-client/app/find-travelers/page.tsx`

```typescript
'use client';

import { Box, Typography, Container } from '@mui/material';
import UserMapSearch from '@/components/UserMapSearch';
import BottomNavigation from '@/components/common/BottomNavigation';

export default function FindTravelersPage() {
  return (
    <>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          Найти путешественников
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Кликните по карте, чтобы найти пользователей поблизости
        </Typography>

        <UserMapSearch />
      </Container>

      <BottomNavigation />
    </>
  );
}
```

---

### **ЭТАП 8: Обновить редактирование профиля**

**Добавить компонент выбора локации:**

**Файл:** `pickom-client/app/components/LocationPicker.tsx`

```typescript
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import 'leaflet/dist/leaflet.css';

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number };
}

export default function LocationPicker({ onLocationSelect, initialPosition }: Props) {
  const [position, setPosition] = useState(
    initialPosition || { lat: 52.2297, lng: 21.0122 }
  );

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        onLocationSelect(lat, lng);
      },
    });

    return <Marker position={position} draggable={true} />;
  }

  return (
    <Box>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '350px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <LocationMarker />
      </MapContainer>

      <Paper sx={{ mt: 1.5, p: 1.5, backgroundColor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">
          📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </Typography>
      </Paper>
    </Box>
  );
}
```

---

## 🎯 ИТОГОВОЕ РЕШЕНИЕ

### **Что вы получите:**

1. ✅ **Редактирование профиля:** Карта для выбора своего местоположения
2. ✅ **Страница поиска:** Карта с поиском пользователей в радиусе
3. ✅ **Отображение маркеров:** Все найденные пользователи на карте
4. ✅ **Фильтр по расстоянию:** Ползунок от 1 до 50 км
5. ✅ **Расчет расстояния:** Показ расстояния до каждого пользователя
6. ✅ **Полностью бесплатно:** OpenStreetMap + PostGIS без лимитов

---

### **Stack:**
- **Frontend:** React + Leaflet + OpenStreetMap (бесплатно, без лимитов)
- **Backend:** NestJS + PostgreSQL + PostGIS (бесплатно)
- **Карты:** OpenStreetMap tiles (бесплатно)

---

### **Время реализации:**
- Backend (PostGIS + API): ~2-3 часа
- Frontend (карты + UI): ~2-3 часа
- Тестирование: ~1 час
- **Итого: ~5-7 часов работы**

---

## 📝 ВАЖНЫЕ ЗАМЕЧАНИЯ

### **PostGIS координаты:**
- В PostGIS POINT использует формат: `POINT(longitude latitude)` - **сначала lng, потом lat!**
- Это отличается от обычного формата (lat, lng)
- SRID 4326 = WGS84 координатная система (GPS координаты)

### **Leaflet координаты:**
- Leaflet использует формат: `[latitude, longitude]` - **сначала lat, потом lng!**
- При передаче данных между frontend и backend следите за порядком

### **Оптимизация:**
- Создайте пространственный индекс на колонке `geolocation` для быстрого поиска
- Используйте `react-leaflet-cluster` для группировки маркеров при большом количестве пользователей
- Кешируйте результаты поиска на frontend

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- [PostGIS Documentation](https://postgis.net/documentation/)
- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Nominatim API (Geocoding)](https://nominatim.org/release-docs/latest/api/Overview/)

---

## ✅ СТАТУС РЕАЛИЗАЦИИ

- [ ] ЭТАП 1: Установка PostGIS
- [ ] ЭТАП 2: Обновление Entity (добавление geolocation)
- [ ] ЭТАП 3: Обновление User Service (методы поиска)
- [ ] ЭТАП 4: Создание API endpoint
- [ ] ЭТАП 5: Установка Leaflet библиотек
- [ ] ЭТАП 6: Компонент карты поиска (UserMapSearch)
- [ ] ЭТАП 7: Страница поиска путешественников
- [ ] ЭТАП 8: Компонент выбора локации для профиля

---

**Дата создания контекста:** 2025-10-14
**Проект:** Pickom MVP
**Цель:** Реализация геопространственного поиска пользователей с использованием бесплатных технологий

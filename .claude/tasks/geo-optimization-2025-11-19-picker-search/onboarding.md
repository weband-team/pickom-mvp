# Task: Оптимизация поиска пикеров по геолокации

**Task ID**: geo-optimization-2025-11-19-picker-search
**Created**: 2025-11-19
**Status**: In Progress

## Task Description

Реализовать алгоритм поиска пикеров на основе геолокации. Пикеры должны отображаться в порядке близости к точке забора посылки (fromLocation), с реальным расстоянием вместо mock-данных. Добавить возможность просмотра пикеров на карте.

### Требования:
- Переключатель "Список / Карта" (по умолчанию список)
- Радиус поиска по типу доставки:
  - City (городская): 10 км
  - Suburban (пригород): 25 км
  - Intercity (междугородняя): 50 км
- Позиция для поиска: от точки забора (fromLocation)

## Goals & Success Criteria

- [ ] Реальное расстояние до пикера (Haversine formula)
- [ ] Сортировка пикеров по близости (ближайшие первые)
- [ ] Фильтрация по радиусу в зависимости от типа доставки
- [ ] Визуализация пикеров на карте с маркерами
- [ ] Переключатель между списком и картой
- [ ] Цветовая индикация расстояния в карточках

## Relevant Files

### Backend (pickom-server)

| Файл | Описание | Что делать |
|------|----------|------------|
| `src/delivery/delivery.controller.ts` | Контроллер, endpoint `GET /pickers` (line 38-49) | Добавить новый endpoint `/pickers/nearby` |
| `src/delivery/delivery.service.ts` | Метод `getAvailablePickers()` (line 26-28) | Добавить `getNearbyPickers()` |
| `src/user/user.service.ts` | Метод `findAllPickers()` | Без изменений |
| `src/user/dto/user.dto.ts` | **Уже есть** `location?: { lat, lng, placeId }` | Без изменений |
| `src/delivery/dto/delivery.dto.ts` | **Уже есть** `deliveryType?: 'within-city' \| 'inter-city'` | Без изменений |

### Frontend (pickom-client)

| Файл | Описание | Что делать |
|------|----------|------------|
| `app/picker-results/page.tsx` | Страница поиска пикеров | Обновить для использования nearby API |
| `app/api/delivery.ts` | API клиент | Добавить `getNearbyPickers()` |
| `types/picker.ts` | **Уже есть** `distance: number` | Добавить `location?` |
| `data/mockPickers.ts` | **Уже есть** `filterPickers()` с сортировкой по distance | Обновить для реальных данных |
| `components/picker/PickerCardMemo.tsx` | Карточка пикера | Добавить цветовую индикацию |

### Новые файлы

| Файл | Описание |
|------|----------|
| `pickom-server/src/utils/geo.utils.ts` | Haversine formula + радиус по типу |
| `pickom-client/components/picker/PickersMap.tsx` | Leaflet карта с маркерами пикеров |

## Context & Research

### Существующие типы (НЕ дублировать!)

**Backend UserDto** (`src/user/dto/user.dto.ts`):
```typescript
export class UserDto {
  // ... other fields
  location?: {
    lat: number;
    lng: number;
    placeId?: string;
  };
}
```

**Frontend Picker** (`types/picker.ts`):
```typescript
export interface Picker extends BaseUserData {
  distance: number;  // УЖЕ ЕСТЬ, сейчас mock
  vehicle?: 'car' | 'bike' | 'scooter' | 'walking';
  // ... other fields
}

export interface PickerFilters {
  sortBy: 'price' | 'duration' | 'trust' | 'rating' | 'distance'; // УЖЕ ЕСТЬ
  // ... other fields
}
```

**DeliveryDto** (`src/delivery/dto/delivery.dto.ts`):
```typescript
deliveryType?: 'within-city' | 'inter-city';  // УЖЕ ЕСТЬ
```

### Текущая проблема

1. Endpoint `GET /pickers` возвращает всех online пикеров без учета локации
2. Location пикера НЕ возвращается в API (хотя хранится в БД)
3. Фронтенд генерирует `distance` случайно: `Math.floor(Math.random() * 20) + 1`

### Текущий flow (line 38-49 в controller)

```typescript
@Get('pickers')
async getAvailablePickers() {
  const pickers = await this.deliveryService.getAvailablePickers();
  return pickers
    .filter((picker) => picker.isOnline === true)
    .map((picker) => ({
      ...picker,
      price: picker.basePrice || 15.0,
    }));
}
```

## Implementation Plan

### Phase 1: Backend - Geo Utilities

1. **Создать** `src/utils/geo.utils.ts`:
   - `calculateHaversineDistance(lat1, lng1, lat2, lng2): number`
   - `getRadiusByDeliveryType(type: 'within-city' | 'inter-city' | 'suburban'): number`

### Phase 2: Backend - New Endpoint

2. **Добавить в** `delivery.service.ts`:
   ```typescript
   async getNearbyPickers(
     lat: number,
     lng: number,
     deliveryType: string
   ): Promise<(User & { distance: number })[]>
   ```
   - Получить всех online пикеров с location
   - Рассчитать distance через Haversine
   - Фильтровать по радиусу
   - Сортировать по distance ASC

3. **Добавить в** `delivery.controller.ts`:
   ```typescript
   @Get('pickers/nearby')
   async getNearbyPickers(
     @Query('lat') lat: number,
     @Query('lng') lng: number,
     @Query('deliveryType') deliveryType: string,
   )
   ```

### Phase 3: Frontend - API & Types

4. **Обновить** `types/picker.ts`:
   ```typescript
   export interface Picker extends BaseUserData {
     // ... existing fields
     location?: {
       lat: number;
       lng: number;
     };
   }
   ```

5. **Добавить в** `app/api/delivery.ts`:
   ```typescript
   export const getNearbyPickers = (
     lat: number,
     lng: number,
     deliveryType: string
   ) => api.get(`/delivery/pickers/nearby?lat=${lat}&lng=${lng}&deliveryType=${deliveryType}`);
   ```

### Phase 4: Frontend - Picker Results Page

6. **Обновить** `app/picker-results/page.tsx`:
   - Получать fromLocation из query params/localStorage
   - Вызывать `getNearbyPickers()` вместо `getAvailablePickers()`
   - Убрать mock для distance
   - Добавить переключатель Список/Карта
   - Добавить выбор типа доставки (влияет на радиус)

### Phase 5: Frontend - Map Component

7. **Создать** `components/picker/PickersMap.tsx`:
   - Leaflet карта (как в TrackingMap.tsx)
   - Маркеры для каждого пикера
   - Popup с: имя, рейтинг, цена, расстояние, кнопка "Выбрать"
   - Circle для визуализации радиуса поиска
   - Маркер для fromLocation (точка забора)

### Phase 6: Frontend - UI Updates

8. **Обновить** `components/picker/PickerCardMemo.tsx`:
   - Показывать реальное расстояние (X.X км)
   - Цветовая индикация:
     - Green (#4caf50): < 2 км - "Рядом"
     - Yellow (#ff9800): 2-5 км - "Близко"
     - Orange (#f44336): 5-10 км - "Далеко"

### Phase 7: Testing & Build

9. Тестирование:
   - Проверить работу с разными типами доставки
   - Проверить карту с маркерами
   - Edge cases: пикер без локации, нет пикеров в радиусе

10. Build & Sync:
    ```bash
    cd pickom-client && npm run build && npx cap sync android
    ```

## Technical Details

### Haversine Formula

```typescript
export function calculateHaversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

### Radius by Delivery Type

| Type | Radius | Use Case |
|------|--------|----------|
| within-city | 10 km | Городская доставка |
| suburban | 25 km | Пригород (новый тип) |
| inter-city | 50 km | Междугородняя |

### Distance Color Coding

| Distance | Color | Badge |
|----------|-------|-------|
| < 2 km | #4caf50 (green) | "Рядом" |
| 2-5 km | #ff9800 (orange) | "Близко" |
| > 5 km | #f44336 (red) | "Далеко" |

## Testing Instructions

### Manual Testing

- [ ] Создать пикера с локацией через PUT /user/:uid/location
- [ ] Создать доставку с fromLocation
- [ ] Перейти на /picker-results с параметрами локации
- [ ] Проверить что пикеры отсортированы по расстоянию
- [ ] Переключить на карту - маркеры на месте
- [ ] Изменить тип доставки - радиус меняется
- [ ] Кликнуть на маркер - popup с инфо

### API Testing

```bash
# Получить пикеров рядом (Minsk center)
curl "http://localhost:4242/delivery/pickers/nearby?lat=53.9&lng=27.55&deliveryType=within-city"
```

### Edge Cases

- [ ] Пикер без локации - не показывать в результатах
- [ ] Нет пикеров в радиусе - показать сообщение "Нет пикеров поблизости"
- [ ] fromLocation не задан - показать ошибку или использовать дефолт

## Checkpoints

[Checkpoints will be added here using /bookmark command]

---

## Notes

- Существующий `filterPickers()` в `data/mockPickers.ts` уже поддерживает сортировку по distance - нужно только подавать реальные данные
- OSRM API можно использовать для более точного ETA (уже используется в TrackingMap), но для MVP достаточно Haversine
- Локация пикера обновляется через `PUT /user/:uid/location`
- Рассмотреть WebSocket для real-time обновления позиций пикеров (future improvement)

# Tracking Page - Executive Summary

## Что создается?

Страница real-time отслеживания доставки `/tracking/[deliveryId]` для платформы Pickom.

**Кто использует**: Sender (отправитель) и Receiver (получатель) смотрят, где находится Picker (курьер)

**Что видят на экране**:
- 🗺️ Интерактивная карта (Leaflet + OpenStreetMap)
- 🟢 Зеленый маркер - откуда забирают посылку
- 🔴 Красный маркер - куда доставляют
- 🔵 Синий маркер - текущая позиция курьера (обновляется каждые 10 сек)
- 🛣️ Синяя линия - маршрут от курьера до точки доставки
- 📊 Информация: расстояние, время в пути, статус

---

## Технологический стек

| Компонент | Технология |
|-----------|------------|
| **Frontend карты** | Leaflet 1.9.4 + react-leaflet 5.0.0 |
| **Тайлы карт** | OpenStreetMap (бесплатные) |
| **Маршрутизация** | OSRM API (Open Source Routing Machine) |
| **Геолокация** | Capacitor Geolocation (для мобильных picker'ов) |
| **Backend** | NestJS + PostgreSQL |
| **Real-time** | Polling (10 сек), позже WebSocket |

---

## Как это работает?

### 1. Sender/Receiver открывает страницу
```
Пользователь → /tracking/123 → Загружает delivery данные → Показывает карту
```

### 2. Picker в процессе доставки
```
Picker (мобильное приложение) → Geolocation GPS → Отправляет координаты на сервер → Обновляет user.location в БД
```

### 3. Real-time обновление
```
Каждые 10 сек → Запрос на сервер → Получает новую позицию picker'а → Пересчитывает маршрут → Обновляет карту
```

---

## Ключевые файлы для реализации

### Backend
```
pickom-server/src/user/user.controller.ts
  └─ Добавить: PUT /user/:uid/location

pickom-server/src/user/user.service.ts
  └─ Добавить: updateLocation(uid, location)

pickom-server/src/delivery/delivery.controller.ts
  └─ Уже есть: GET /delivery/requests/:id
```

### Frontend
```
pickom-client/app/tracking/[deliveryId]/page.tsx
  └─ Новая страница (основной код)

pickom-client/app/api/tracking.ts
  └─ API клиент для tracking endpoints

pickom-client/components/LocationPicker.tsx ✅ Уже есть
pickom-client/components/DualLocationPicker.tsx ✅ Уже есть
  └─ Можно использовать как reference
```

### Mobile (для Picker)
```
pickom-client/app/active-delivery/[id]/page.tsx
  └─ Добавить: Geolocation tracking (автоматическое обновление location)
```

---

## Данные в базе

### Таблица `deliveries`
```json
{
  "fromLocation": {"lat": 53.9006, "lng": 27.5590, "address": "..."},
  "toLocation": {"lat": 53.9100, "lng": 27.5700, "address": "..."},
  "pickerId": 5,
  "status": "picked_up"
}
```

### Таблица `users` (для picker'а)
```json
{
  "id": 5,
  "uid": "firebase-uid-picker",
  "role": "picker",
  "location": {"lat": 53.9050, "lng": 27.5650, "address": "..."}
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
               ТЕКУЩАЯ ПОЗИЦИЯ - обновляется в реальном времени
}
```

---

## API Calls

### Frontend делает запросы:

1. **Загрузка delivery**:
   ```
   GET /delivery/requests/123
   Response: {fromLocation, toLocation, picker, sender, recipient, status}
   ```

2. **Получение позиции picker'а** (polling каждые 10 сек):
   ```
   GET /user/picker-firebase-uid
   Response: {location: {lat, lng, address}, name, rating, phone, ...}
   ```

3. **Построение маршрута** (OSRM):
   ```
   GET https://router.project-osrm.org/route/v1/driving/{lng},{lat};{lng},{lat}?...
   Response: {routes: [{geometry: {coordinates: [...]}, distance, duration}]}
   ```

### Picker (mobile) обновляет позицию:

```
PUT /user/picker-firebase-uid/location
Body: {location: {lat: 53.9055, lng: 27.5655}}
```

---

## Основной код страницы (упрощенно)

```typescript
'use client';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function TrackingPage({ params }) {
  const [delivery, setDelivery] = useState(null);
  const [pickerLocation, setPickerLocation] = useState(null);
  const [route, setRoute] = useState(null);

  // 1. Загрузить delivery при монтировании
  useEffect(() => {
    fetch(`/api/delivery/requests/${params.deliveryId}`)
      .then(r => r.json())
      .then(setDelivery);
  }, []);

  // 2. Polling - обновлять picker location каждые 10 сек
  useEffect(() => {
    if (!delivery?.picker) return;

    const interval = setInterval(async () => {
      const picker = await fetch(`/api/user/${delivery.picker.uid}`).then(r => r.json());
      setPickerLocation(picker.location);

      // Пересчитать маршрут
      const newRoute = await calculateRoute(picker.location, delivery.toLocation);
      setRoute(newRoute);
    }, 10000);

    return () => clearInterval(interval);
  }, [delivery]);

  // 3. Рендер карты
  return (
    <MapContainer center={[delivery.toLocation.lat, delivery.toLocation.lng]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* From marker (green) */}
      <Marker position={[delivery.fromLocation.lat, delivery.fromLocation.lng]} icon={greenIcon} />

      {/* To marker (red) */}
      <Marker position={[delivery.toLocation.lat, delivery.toLocation.lng]} icon={redIcon} />

      {/* Picker marker (blue) */}
      {pickerLocation && (
        <Marker position={[pickerLocation.lat, pickerLocation.lng]} icon={blueIcon}>
          <Popup>
            <div>
              <h3>{delivery.picker.name}</h3>
              <p>Rating: {delivery.picker.rating} ⭐</p>
              <p>Phone: {delivery.picker.phone}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Route polyline */}
      {route && <Polyline positions={route.coordinates} color="#2563eb" />}
    </MapContainer>
  );
}
```

---

## Время реализации

| Задача | Время |
|--------|-------|
| Backend endpoint (PUT /user/:uid/location) | 30 мин |
| Frontend TrackingPage основа | 2 часа |
| Интеграция OSRM маршрутизации | 1 час |
| Polling логика | 30 мин |
| Geolocation в picker app | 1 час |
| Тестирование и отладка | 1-2 часа |
| **ИТОГО** | **5-7 часов** |

---

## Основные вызовы

### 1. SSR Issue с Leaflet
**Проблема**: Leaflet требует `window` объект, который недоступен на сервере

**Решение**:
```typescript
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);
if (!isMounted) return <div>Loading map...</div>;
```

### 2. Формат координат OSRM vs Leaflet
**Проблема**: OSRM возвращает `[lng, lat]`, Leaflet ожидает `[lat, lng]`

**Решение**:
```typescript
const coordinates = osrmData.geometry.coordinates.map(
  coord => [coord[1], coord[0]] // swap lng/lat → lat/lng
);
```

### 3. Battery drain от Geolocation
**Проблема**: Постоянный GPS tracking съедает батарею

**Решение**:
- Использовать `maximumAge` для кеширования
- Запускать tracking только при статусе `picked_up`
- Останавливать при `delivered` или `cancelled`

---

## Следующие шаги

### Для начала работы:
1. ✅ Прочитать `TRACKING_PAGE_CONTEXT.md` (полная документация)
2. ✅ Изучить `TRACKING_PAGE_QUICKSTART.md` (пошаговый гайд)
3. ✅ Посмотреть `TRACKING_ARCHITECTURE.md` (архитектура)

### MVP реализация (в порядке приоритета):
1. ⭐ Backend: `PUT /user/:uid/location` endpoint
2. ⭐ Frontend: Базовая страница `/tracking/[id]` с картой
3. ⭐ Frontend: Polling для обновления picker location
4. ⭐ Frontend: OSRM интеграция для маршрута
5. 🔄 Mobile: Geolocation tracking в active-delivery page

### Опционально (после MVP):
6. WebSocket вместо polling
7. Анимация перемещения маркера
8. Push notifications
9. История траектории движения

---

## Доступные ресурсы

### Документация
- **Полный контекст**: `TRACKING_PAGE_CONTEXT.md` (детальный)
- **Quick Start**: `TRACKING_PAGE_QUICKSTART.md` (с примерами кода)
- **Архитектура**: `TRACKING_ARCHITECTURE.md` (диаграммы)
- **Этот файл**: `TRACKING_SUMMARY.md` (краткая сводка)

### Внешние ссылки
- Leaflet: https://leafletjs.com/
- React-Leaflet: https://react-leaflet.js.org/
- OSRM API: https://project-osrm.org/docs/v5.24.0/api/
- Capacitor Geolocation: https://capacitorjs.com/docs/apis/geolocation

### Существующий код в проекте
- `pickom-client/components/LocationPicker.tsx` - пример карты с одним маркером
- `pickom-client/components/DualLocationPicker.tsx` - пример с двумя маркерами + OSRM
- `pickom-client/app/active-delivery/[id]/page.tsx` - страница активной доставки (picker)

---

## Визуализация результата

```
┌────────────────────────────────────────────────────────────┐
│ Pickom - Delivery Tracking                           [X]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │                                                    │   │
│  │         🗺️ OpenStreetMap                          │   │
│  │                                                    │   │
│  │    🟢 Pickup Point                                │   │
│  │     (fromLocation)                                │   │
│  │                                                    │   │
│  │              🔵 Picker                            │   │
│  │            (moving marker)                        │   │
│  │                  │                                │   │
│  │                  │ 🛣️ Route                      │   │
│  │                  │ (Blue polyline)               │   │
│  │                  ▼                                │   │
│  │                                                    │   │
│  │                 🔴 Delivery Point                 │   │
│  │                  (toLocation)                     │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  📦 Package: "Important Documents"                        │
│  📍 Status: Picked Up                                     │
│  📏 Distance: 12.5 km                                     │
│  ⏱️ ETA: 25 min                                           │
│                                                            │
│  🚗 Picker: John Smith ⭐ 4.8                             │
│     📞 +375 29 123 45 67                                  │
│     ✅ 156 completed deliveries                           │
│                                                            │
│  [Open Chat] [Contact Support]                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Checklist реализации

### Backend
- [ ] Добавить `PUT /user/:uid/location` endpoint
- [ ] Добавить `updateLocation()` в UserService
- [ ] Протестировать обновление location через Postman

### Frontend - Страница
- [ ] Создать `/app/tracking/[deliveryId]/page.tsx`
- [ ] Добавить `'use client'` и SSR handling
- [ ] Импортировать Leaflet компоненты
- [ ] Настроить три маркера (from, to, picker)

### Frontend - Логика
- [ ] Загрузка delivery при mount
- [ ] Polling каждые 10 сек
- [ ] Интеграция OSRM для маршрута
- [ ] Обработка ошибок (fallback на прямую линию)

### Frontend - UI
- [ ] Информационная панель (title, status, distance, ETA)
- [ ] Popup на picker marker (name, rating, phone)
- [ ] Loading и error states
- [ ] Responsive дизайн

### Mobile (Picker App)
- [ ] Добавить Geolocation tracking в active-delivery
- [ ] Автоматическое обновление при статусе `picked_up`
- [ ] Остановка tracking при `delivered`/`cancelled`

### Тестирование
- [ ] Desktop браузер
- [ ] Mobile браузер
- [ ] Android приложение (Capacitor)
- [ ] Проверка батареи на мобильном

---

**Статус**: Готово к реализации ✅
**Приоритет**: Высокий (ключевая фича MVP)
**Сложность**: Средняя
**Зависимости**: Все необходимые библиотеки уже установлены

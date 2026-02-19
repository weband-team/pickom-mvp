# Task: Selective Integration of Maps Functionality from improve branch

**Task ID**: integration-2025-10-20-maps-from-improve-branch
**Created**: 2025-10-20
**Status**: 🟡 In Progress

## 📋 Task Description

Выборочная интеграция функционала карт из ветки `origin/frontend-backend-integration-improve` в текущую ветку `frontend-backend-integration`.

**ВАЖНО:** Не делаем merge, а выборочно берем только файлы и изменения связанные с интеграцией карт (Leaflet + OpenStreetMap).

## 🗺️ Что интегрируется

### Технологический стек карт:
- **Leaflet** (v1.9.4) - библиотека для интерактивных карт
- **React-Leaflet** (v5.0.0) - React обертка для Leaflet
- **OpenStreetMap** - бесплатный source карт
- **OSRM** - бесплатный routing API для построения маршрутов
- **Nominatim** - geocoding API для получения адресов

**НЕ Google Maps!** Это полностью бесплатное решение без API ключей.

## 🎯 Goals & Success Criteria

- [x] Проанализировать изменения в ветке `frontend-backend-integration-improve`
- [ ] Интегрировать новые компоненты карт (LocationPicker, DualLocationPicker)
- [ ] Обновить страницу создания заказа с интеграцией карт
- [ ] Добавить страницу редактирования профиля с выбором локации
- [ ] Применить миграции базы данных для location полей
- [ ] Обновить DTOs и entities на backend
- [ ] Добавить зависимости (leaflet, react-leaflet)
- [ ] Протестировать функционал выбора локаций
- [ ] Протестировать построение маршрутов
- [ ] Протестировать ограничения по типу доставки

## 📁 Files to Integrate

### Frontend - Новые файлы:

#### Компоненты карт:
- ✅ `pickom-client/components/LocationPicker.tsx` - компонент выбора одной локации
  - Leaflet карта с маркером
  - Клик по карте для выбора
  - Кнопка "Use My Location" для геолокации
  - Props: `onLocationSelect`, `initialPosition`

- ✅ `pickom-client/components/DualLocationPicker.tsx` - компонент выбора двух локаций
  - Два маркера (зеленый FROM, красный TO)
  - Переключение активного маркера (toggle buttons)
  - Автоматическое построение маршрута через OSRM API
  - Отображение polyline маршрута
  - Показ расстояния и времени в пути
  - Ограничения по типу доставки (within-city, inter-city, international)
  - Props: `onFromLocationSelect`, `onToLocationSelect`, `deliveryType`, `onRouteCalculated`

#### Страницы:
- ✅ `pickom-client/app/profile/edit/page.tsx` - редактирование профиля с выбором локации

### Frontend - Измененные файлы:

- ✅ `pickom-client/app/package-type/page.tsx`
  - Интеграция DualLocationPicker
  - Замена строковых адресов на LocationData объекты
  - Использование `fromLocation`, `toLocation` вместо `fromAddress`, `toAddress`

- ⚠️ `pickom-client/app/delivery-methods/page.tsx` (проверить изменения)
- ⚠️ `pickom-client/app/profile/page.tsx` (проверить изменения)

### Frontend - Dependencies:

- ✅ `pickom-client/package.json`
  ```json
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "@types/leaflet": "^1.9.21"
  ```

### Frontend - API Changes:

- ✅ `pickom-client/app/api/delivery.ts`
  - Обновить типы: `fromLocation`, `toLocation` вместо адресов

- ✅ `pickom-client/app/api/dto/user.ts` (проверить изменения для location)
- ✅ `pickom-client/app/api/user.ts` (проверить изменения)

### Backend - Migrations:

- ✅ `pickom-server/src/migrations/1729099200000-UpdateDeliveryLocationFields.ts`
  - Добавляет JSONB поля `from_location` и `to_location`
  - Мигрирует данные из старых строковых полей
  - Удаляет старые поля (`from_address`, `from_city`, `to_address`, `to_city`)

- ✅ `pickom-server/src/migrations/1760465353226-AddAboutAndLocationToUser.ts`
  - Добавляет поле `location` в User entity
  - Добавляет поле `about` для описания профиля

### Backend - DTOs:

- ✅ `pickom-server/src/delivery/dto/create-delivery.dto.ts`
  - Новый `LocationDto` class:
    ```typescript
    class LocationDto {
      lat: number;
      lng: number;
      address: string;
      city?: string;
      placeId?: string;
    }
    ```
  - Замена `fromAddress`, `toAddress` на `fromLocation`, `toLocation`

- ✅ `pickom-server/src/delivery/dto/delivery.dto.ts` - аналогичные изменения
- ✅ `pickom-server/src/delivery/dto/update-delivery.dto.ts` - аналогичные изменения

### Backend - Entities:

- ✅ `pickom-server/src/delivery/entities/delivery.entity.ts`
  - Замена строковых полей на JSONB:
    ```typescript
    @Column({ type: 'jsonb' })
    fromLocation: {
      lat: number;
      lng: number;
      address: string;
      city?: string;
      placeId?: string;
    };

    @Column({ type: 'jsonb' })
    toLocation: { ... };
    ```

- ✅ `pickom-server/src/user/entities/user.entity.ts`
  - Добавление `location` поля (JSONB)
  - Добавление `about` поля (text)

### Backend - Services:

- ✅ `pickom-server/src/delivery/delivery.service.ts`
  - Обновление методов для работы с location объектами

- ✅ `pickom-server/src/user/user.service.ts`
  - Возможно добавление методов для location

### Backend - Controllers:

- ⚠️ `pickom-server/src/offer/offer.controller.ts` (проверить изменения)

### Backend - Mocks:

- ✅ `pickom-server/src/mocks/delivery-requests.mock.ts`
  - Обновление mock данных для использования location объектов

### Context Documents:

- ✅ `MAPS_GEOLOCATION_CONTEXT.md` - подробное руководство по геолокации
- ✅ `DELIVERY_TYPE_RESTRICTIONS_CONTEXT.md` - ограничения по типам доставки
- ✅ `MAP_ROUTES_CONTEXT.md` - построение маршрутов

## 🔍 Context & Research

### Анализ ветки origin/frontend-backend-integration-improve

**Общий предок:** `f36e546` (full-frontend-backend-integration)

**Коммиты с функционалом карт:**
1. `b2630a0` - add clear button
2. `28bd290` - add inner/within city set location
3. `0d281cd` - add routers on map and different marks for the send from/to location
4. `b863386` - add map with location pick on create delivery
5. `66b7c7e` - add getting map geolocation in profile edit

**Всего изменений:**
- 31 файл изменен/добавлен
- Из них ~15-18 файлов напрямую связаны с картами

### Key Dependencies

**Frontend:**
- `leaflet` - основная библиотека карт
- `react-leaflet` - React интеграция
- OpenStreetMap tiles (бесплатно, без API ключа)
- OSRM API для routing (бесплатно)
- Nominatim API для geocoding (бесплатно)

**Backend:**
- PostgreSQL JSONB для хранения location данных
- TypeORM для миграций

### Related Components

**Компоненты карт:**
1. `LocationPicker` - базовый компонент выбора локации
2. `DualLocationPicker` - продвинутый компонент с двумя маркерами и маршрутом

**Страницы использующие карты:**
1. `package-type/page.tsx` - создание заказа с выбором from/to
2. `profile/edit/page.tsx` - редактирование профиля с выбором домашней локации

### Важные архитектурные решения

1. **Листенинг координат:** Leaflet использует `[lat, lng]`, а PostGIS `POINT(lng, lat)` - порядок разный!

2. **LocationData interface:**
   ```typescript
   interface LocationData {
     lat: number;
     lng: number;
     address: string;
     city?: string;
     country?: string;
     placeId?: string;
   }
   ```

3. **Типы доставки и ограничения:**
   - `within-city` - оба адреса в одном городе (ограничение по city)
   - `inter-city` - оба адреса в одной стране (ограничение по country)
   - `international` - без ограничений

4. **Построение маршрута:**
   - Используется OSRM API: `https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}`
   - Возвращает coordinates для polyline, distance, duration

5. **Geocoding (обратный):**
   - Nominatim API: `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json`
   - Получает полный адрес по координатам

## 📝 Implementation Plan

### Phase 1: Preparation & Analysis ✅
1. ✅ Fetch remote branch
2. ✅ Analyze changed files
3. ✅ Read context documents
4. ✅ Create onboarding document

### Phase 2: Frontend - Dependencies & Components
1. Install dependencies
   ```bash
   cd pickom-client
   npm install leaflet@^1.9.4 react-leaflet@^5.0.0
   npm install -D @types/leaflet@^1.9.21
   ```

2. Copy new components
   - Copy `components/LocationPicker.tsx`
   - Copy `components/DualLocationPicker.tsx`
   - Verify imports and dependencies

3. Add CSS for Leaflet
   - Ensure `import 'leaflet/dist/leaflet.css'` works properly
   - May need next.config.js adjustments

### Phase 3: Frontend - Update Existing Pages
1. Update `package-type/page.tsx`
   - Import DualLocationPicker
   - Replace address inputs with map picker
   - Update localStorage structure to use LocationData
   - Update form submission to use fromLocation/toLocation

2. Create `profile/edit/page.tsx`
   - Copy from improve branch
   - Integrate LocationPicker
   - Connect with user API

3. Update `delivery-methods/page.tsx` (if needed)
   - Check if there are map-related changes
   - Apply only map-related updates

### Phase 4: Frontend - API Updates
1. Update `api/delivery.ts`
   - Update interfaces to use LocationData
   - Change `fromAddress`, `toAddress` to `fromLocation`, `toLocation`

2. Update `api/user.ts` (if needed)
   - Check for location field updates
   - Update DTOs if necessary

### Phase 5: Backend - Migrations
1. Copy migration files
   - `1729099200000-UpdateDeliveryLocationFields.ts`
   - `1760465353226-AddAboutAndLocationToUser.ts`

2. Run migrations
   ```bash
   cd pickom-server
   npm run migration:run
   ```

3. Verify database schema
   - Check `from_location` and `to_location` columns in deliveries table
   - Check `location` column in users table

### Phase 6: Backend - DTOs & Entities
1. Update `delivery/dto/create-delivery.dto.ts`
   - Add LocationDto class
   - Replace address fields with location fields

2. Update `delivery/dto/delivery.dto.ts`
   - Similar LocationDto changes

3. Update `delivery/dto/update-delivery.dto.ts`
   - Similar LocationDto changes

4. Update `delivery/entities/delivery.entity.ts`
   - Change columns from string to jsonb
   - Update types

5. Update `user/entities/user.entity.ts`
   - Add location field
   - Add about field

### Phase 7: Backend - Services & Controllers
1. Update `delivery/delivery.service.ts`
   - Update methods to work with location objects
   - Update entityToDto to handle locations

2. Update `user/user.service.ts` (if needed)
   - Check for location-related methods

3. Update mocks
   - Update `delivery-requests.mock.ts` with location data

### Phase 8: Testing & Verification
1. Manual testing - Frontend
   - [ ] Open package-type page
   - [ ] Click on map to select FROM location
   - [ ] Switch to TO marker
   - [ ] Click on map to select TO location
   - [ ] Verify route is drawn
   - [ ] Verify distance and duration shown
   - [ ] Test "Use My Location" button
   - [ ] Test delivery type restrictions (within-city, inter-city)

2. Manual testing - Backend
   - [ ] Create delivery with location data
   - [ ] Verify location stored in database as JSONB
   - [ ] Retrieve delivery and verify location data
   - [ ] Test with different delivery types

3. Integration testing
   - [ ] Complete order creation flow with maps
   - [ ] Verify data flows from frontend to backend correctly
   - [ ] Test profile edit with location picker

### Phase 9: Documentation & Cleanup
1. Copy context documents to root
   - MAPS_GEOLOCATION_CONTEXT.md
   - DELIVERY_TYPE_RESTRICTIONS_CONTEXT.md
   - MAP_ROUTES_CONTEXT.md

2. Update README if needed
3. Commit changes with clear message
4. Update BOOKMARK

## 🧪 Testing Instructions

### Manual Testing - LocationPicker

**Test Case 1: Basic Map Interaction**
- [ ] Component renders with default Warsaw position
- [ ] Can click anywhere on map to select location
- [ ] Marker moves to clicked position
- [ ] Coordinates display updates
- [ ] onLocationSelect callback fires with correct lat/lng

**Test Case 2: Geolocation**
- [ ] "Use My Location" button visible
- [ ] Clicking button requests browser geolocation
- [ ] On success, map centers to user location
- [ ] On error, shows appropriate error message
- [ ] Error handled gracefully if permission denied

**Test Case 3: Initial Position**
- [ ] Passing initialPosition prop sets correct starting position
- [ ] Marker appears at initialPosition
- [ ] Map centers on initialPosition

### Manual Testing - DualLocationPicker

**Test Case 1: Dual Markers**
- [ ] Two markers appear (green FROM, red TO)
- [ ] Toggle buttons switch active marker
- [ ] Clicking map updates active marker position
- [ ] Inactive marker stays in place

**Test Case 2: Route Calculation**
- [ ] Route draws automatically when both markers set
- [ ] Polyline connects FROM to TO markers
- [ ] Distance shown in km
- [ ] Duration shown in minutes
- [ ] Route info updates when markers move

**Test Case 3: Delivery Type Restrictions - Within City**
- [ ] Set deliveryType to 'within-city'
- [ ] Select FROM location in Warsaw
- [ ] Try to select TO location in different city
- [ ] Alert/error shown: "You can only select locations within Warsaw"
- [ ] TO location not set

**Test Case 4: Delivery Type Restrictions - Inter City**
- [ ] Set deliveryType to 'inter-city'
- [ ] Select FROM location in Warsaw, Poland
- [ ] Can select TO location in Lodz, Poland (different city, same country)
- [ ] Try to select TO location in Berlin, Germany
- [ ] Alert/error shown: "You can only select locations within Poland"

**Test Case 5: Clear Functionality**
- [ ] Clear button visible when locations set
- [ ] Clicking clear removes both markers
- [ ] Route disappears
- [ ] Distance/duration info cleared

### Manual Testing - Package Type Page Integration

**Test Case 1: Map Integration in Flow**
- [ ] Navigate to /delivery-methods → Send Package
- [ ] DualLocationPicker renders instead of address inputs
- [ ] Can select both FROM and TO locations on map
- [ ] Route displays correctly
- [ ] Click Continue navigates to package-type page
- [ ] Location data persisted in localStorage

**Test Case 2: Location Data in Order Creation**
- [ ] Complete package type form
- [ ] Submit order
- [ ] Verify API request contains fromLocation and toLocation objects
- [ ] Verify objects have lat, lng, address, city fields
- [ ] Order created successfully

### Backend Testing

**Test Case 1: Migration**
- [ ] Run migrations successfully
- [ ] Verify `from_location` column exists (jsonb type)
- [ ] Verify `to_location` column exists (jsonb type)
- [ ] Verify old columns removed (from_address, to_address, etc)

**Test Case 2: Location Data Storage**
- [ ] Create delivery with location objects
- [ ] Query database directly
- [ ] Verify JSONB structure correct
- [ ] Verify all fields stored (lat, lng, address, city)

**Test Case 3: API Responses**
- [ ] GET /delivery/requests returns location objects
- [ ] Location objects properly serialized
- [ ] Old address fields not present

## 🔖 Checkpoints

### Checkpoint 1: Dependencies Installed ⏸️
- Leaflet libraries added to package.json
- Types installed
- npm install completed without errors

### Checkpoint 2: Components Copied ⏸️
- LocationPicker.tsx integrated
- DualLocationPicker.tsx integrated
- Components render without errors
- Basic map displays

### Checkpoint 3: Backend Migrations Applied ⏸️
- Migrations copied to migrations folder
- npm run migration:run successful
- Database schema updated correctly
- Old data migrated (if any)

### Checkpoint 4: DTOs & Entities Updated ⏸️
- LocationDto class created
- All DTOs updated with location fields
- Entities updated with jsonb columns
- Types aligned between frontend and backend

### Checkpoint 5: Package Type Page Updated ⏸️
- DualLocationPicker integrated in flow
- Location data saved to localStorage
- Order creation uses location objects
- No address string inputs remain

### Checkpoint 6: Full Flow Tested ⏸️
- Can create order with map selection
- Data flows correctly to backend
- Order stored with location data
- Can retrieve and display order with locations

## 📚 Technical Notes

### Leaflet Map Loading
- Leaflet requires client-side rendering (use 'use client' directive)
- CSS must be imported: `import 'leaflet/dist/leaflet.css'`
- Default marker icons may need fixing:
  ```typescript
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({ ... });
  ```

### Coordinate Systems
- **Leaflet:** Uses `[lat, lng]` order
- **OSRM API:** Returns `[lng, lat]` in geometry - must reverse!
- **Nominatim:** Uses `lat` and `lon` query params
- **PostGIS POINT:** `POINT(lng, lat)` - longitude first!

### API Rate Limits
- **OSM Tiles:** Unlimited (but respect fair use policy)
- **OSRM Routing:** No strict limit, but avoid abuse
- **Nominatim Geocoding:** Max 1 request/second
  - Add delay between requests if doing bulk geocoding
  - Consider caching results

### Browser Geolocation
- Requires HTTPS in production (or localhost in dev)
- User must grant permission
- May not work in all browsers/devices
- Timeout after 10 seconds default
- Fallback to default position if fails

### JSONB in PostgreSQL
- Efficient storage and querying
- Can index specific fields: `CREATE INDEX idx_city ON deliveries((from_location->>'city'))`
- Query syntax: `WHERE from_location->>'city' = 'Warsaw'`
- TypeORM handles serialization automatically

### React-Leaflet v5 Changes
- Uses new React 18+ hooks
- MapContainer must have height set
- Some components require `useMap()` hook
- Position must be `[lat, lng]` not object

## 🚧 Potential Issues & Solutions

### Issue 1: Leaflet CSS not loading
**Symptom:** Map displays but controls/markers invisible or misaligned
**Solution:**
```typescript
import 'leaflet/dist/leaflet.css';
```
Add to global CSS or component

### Issue 2: "window is not defined" error
**Symptom:** Error during SSR/build
**Solution:** Use dynamic import with `ssr: false`
```typescript
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false
});
```

### Issue 3: Marker icons not showing
**Symptom:** Markers work but no icon visible
**Solution:** Fix icon defaults as shown in technical notes

### Issue 4: Migration conflicts
**Symptom:** Migration fails if from_location already exists
**Solution:** Check migration code - it includes existence checks

### Issue 5: Old data migration
**Symptom:** Existing deliveries have null locations
**Solution:** Migration includes data transformation from old fields

### Issue 6: CORS errors with OSRM/Nominatim
**Symptom:** API calls blocked by browser
**Solution:** APIs support CORS, but if issues persist:
- Use backend proxy
- Or host own OSRM/Nominatim instance

## 📅 Timeline Estimate

- **Phase 1:** ✅ Complete (1 hour)
- **Phase 2:** 1-2 hours (dependencies + components)
- **Phase 3:** 2-3 hours (page integration)
- **Phase 4:** 0.5 hour (API updates)
- **Phase 5:** 1 hour (migrations)
- **Phase 6:** 1-2 hours (DTOs/Entities)
- **Phase 7:** 1-2 hours (Services)
- **Phase 8:** 2-3 hours (Testing)
- **Phase 9:** 0.5 hour (Documentation)

**Total:** ~10-15 hours

## ✅ Definition of Done

- [ ] All map components integrated and working
- [ ] Package creation flow uses maps instead of text inputs
- [ ] Backend accepts and stores location objects correctly
- [ ] Migrations applied successfully
- [ ] All DTOs and entities updated
- [ ] Route calculation works
- [ ] Delivery type restrictions enforced
- [ ] Geolocation feature works
- [ ] All manual tests pass
- [ ] Code committed with clear message
- [ ] BOOKMARK updated with completion status
- [ ] Context documents copied to project root

---

**Created by:** Claude Code
**Last Updated:** 2025-10-20

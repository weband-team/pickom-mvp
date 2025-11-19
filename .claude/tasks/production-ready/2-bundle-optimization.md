# Task 2: Bundle Optimization

**Приоритет:** КРИТИЧНО
**Время:** 1 день
**Зависит от:** Task 1 (Code Quality Fixes)

## Цель
Уменьшить размер JavaScript bundle на ~15-20% путем удаления неиспользуемых зависимостей и добавления code splitting.

## Проблема
- Используются **ДВЕ** библиотеки карт (Leaflet + Google Maps) = лишние ~150KB
- Неиспользуемые зависимости (@mui/x-data-grid, Storybook в dependencies)
- Отсутствует code splitting для тяжелых компонентов
- Текущий First Load JS: **101 kB**

## Подзадачи

### 2.1. Удалить Google Maps (оставить Leaflet)

**Анализ использования:**
- ✅ **Leaflet** используется активно:
  - `components/LocationPicker.tsx` - выбор локации для профиля
  - `components/DualLocationPicker.tsx` - выбор маршрута доставки
- ❌ **Google Maps** не используется реально:
  - `@googlemaps/js-api-loader` импортирован но не используется
  - API ключ есть но не задействован

**Причина выбора Leaflet:**
- Бесплатный (OpenStreetMap)
- Меньший bundle size
- Уже интегрирован и работает
- Не требует API ключей

**Шаги:**

- [ ] 2.1.1. Проверить что Google Maps нигде не используется
  ```bash
  cd pickom-client
  grep -r "@googlemaps" app/
  grep -r "google.maps" app/
  grep -r "Loader" app/ | grep -i google
  ```
  - Убедиться что результатов нет или они в комментариях

- [ ] 2.1.2. Удалить Google Maps зависимости
  ```bash
  cd pickom-client
  npm uninstall @googlemaps/js-api-loader
  npm uninstall -D @types/google.maps
  ```

- [ ] 2.1.3. Удалить NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  - Открыть `.env`
  - Удалить строку с `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  - Обновить `.env.example` (когда будет создан)

- [ ] 2.1.4. Проверить что все работает
  ```bash
  npm run dev
  ```
  - Открыть `/profile/edit` - проверить что карта работает
  - Открыть `/delivery-methods` - проверить что карта работает

- [ ] 2.1.5. Проверить bundle size
  ```bash
  npm run build
  ```
  - Сравнить размер First Load JS (должен уменьшиться на ~20KB)

**Ожидаемый результат:**
- Google Maps удален
- Leaflet работает
- Bundle size уменьшен на ~20KB

---

### 2.2. Удалить @mui/x-data-grid

**Проблема:** Библиотека установлена но не используется (~200KB)

**Шаги:**

- [ ] 2.2.1. Проверить что не используется
  ```bash
  cd pickom-client
  grep -r "x-data-grid" app/
  grep -r "DataGrid" app/
  grep -r "@mui/x-data-grid" app/
  ```
  - Убедиться что результатов нет

- [ ] 2.2.2. Удалить зависимость
  ```bash
  npm uninstall @mui/x-data-grid
  ```

- [ ] 2.2.3. Проверить что билд работает
  ```bash
  npm run build
  ```

**Ожидаемый результат:** @mui/x-data-grid удален, билд проходит

---

### 2.3. Переместить Storybook в devDependencies

**Проблема:** Storybook установлен как production dependency

**Шаги:**

- [ ] 2.3.1. Открыть `package.json`
- [ ] 2.3.2. Переместить следующие пакеты из `dependencies` в `devDependencies`:
  ```json
  "@storybook/addon-actions": "^8.6.14",
  "@storybook/addon-controls": "^8.6.14",
  "@storybook/addon-essentials": "^8.6.14",
  "@storybook/react": "^8.6.14",
  "@storybook/react-vite": "^8.6.14",
  "storybook": "^8.6.14"
  ```

- [ ] 2.3.3. Переустановить зависимости
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

- [ ] 2.3.4. Проверить что Storybook работает
  ```bash
  npm run storybook
  ```

**Ожидаемый результат:** Storybook в devDependencies, работает

---

### 2.4. Добавить dynamic import для DualLocationPicker

**Проблема:** Тяжелый компонент с картой загружается сразу

**Файл:** `app/delivery-methods/page.tsx`

**Шаги:**

- [ ] 2.4.1. Открыть `app/delivery-methods/page.tsx`
- [ ] 2.4.2. Добавить dynamic import в начало файла:
  ```typescript
  import dynamic from 'next/dynamic';
  import { CircularProgress, Box } from '@mui/material';

  const DualLocationPicker = dynamic(
    () => import('@/components/DualLocationPicker'),
    {
      ssr: false,
      loading: () => (
        <Box sx={{
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress />
        </Box>
      ),
    }
  );
  ```

- [ ] 2.4.3. Удалить обычный import DualLocationPicker
- [ ] 2.4.4. Проверить что компонент работает
  - Запустить: `npm run dev`
  - Открыть `/delivery-methods`
  - Убедиться что карта загружается с loader'ом

**Ожидаемый результат:** DualLocationPicker загружается динамически

---

### 2.5. Добавить dynamic import для тяжелых MUI компонентов

**Проблема:** SwipeableDrawer используется в модалках но загружается сразу

**Файлы для оптимизации:**
- `app/available-deliveries/page.tsx` (SwipeableDrawer для Make Offer)
- Другие файлы с модалками (опционально)

**Шаги:**

- [ ] 2.5.1. Найти все использования SwipeableDrawer
  ```bash
  grep -r "SwipeableDrawer" app/
  ```

- [ ] 2.5.2. Для available-deliveries/page.tsx:
  ```typescript
  import dynamic from 'next/dynamic';

  const SwipeableDrawer = dynamic(
    () => import('@mui/material/SwipeableDrawer').then(mod => ({ default: mod.SwipeableDrawer })),
    { ssr: false }
  );
  ```

- [ ] 2.5.3. Проверить что модалка работает
  - Открыть `/available-deliveries`
  - Кликнуть "Make Offer"
  - Убедиться что модалка открывается

**Ожидаемый результат:** SwipeableDrawer загружается динамически

---

### 2.6. Оптимизировать DateTimePicker (опционально)

**Анализ:**
- `@mui/x-date-pickers` используется в `components/ui/forms/DateTimePicker.tsx`
- Размер: ~200KB
- Альтернатива: `react-datepicker` (~20KB)

**Решение:** Пока оставить, но рассмотреть замену в будущем если станет проблемой

**Шаги (опционально):**

- [ ] 2.6.1. Добавить dynamic import для DateTimePicker компонента
  ```typescript
  // Везде где используется DateTimePicker
  const DateTimePicker = dynamic(
    () => import('@/components/ui/forms/DateTimePicker').then(mod => ({ default: mod.DateTimePicker })),
    { ssr: false, loading: () => <CircularProgress /> }
  );
  ```

**Ожидаемый результат:** DateTimePicker загружается динамически

---

### 2.7. Проверить размер bundle после оптимизаций

**Шаги:**

- [ ] 2.7.1. Запустить production build
  ```bash
  cd pickom-client
  npm run build
  ```

- [ ] 2.7.2. Сравнить метрики

  **ДО оптимизации:**
  ```
  First Load JS: 101 kB
  Total dependencies: 51
  ```

  **ПОСЛЕ оптимизации (ожидаемое):**
  ```
  First Load JS: ~85 kB (-15%)
  Total dependencies: ~45 (-12%)
  ```

- [ ] 2.7.3. Записать результаты в этот файл

- [ ] 2.7.4. Проверить что все страницы работают
  - Запустить: `npm run start`
  - Проверить основные страницы:
    - `/` - главная
    - `/profile/edit` - карта Leaflet
    - `/delivery-methods` - карта DualLocationPicker
    - `/available-deliveries` - модалка Make Offer

**Ожидаемый результат:** Bundle size уменьшен на 15-20%

---

## Критерии успеха

### До:
- First Load JS: **101 kB**
- Dependencies: **51**
- Две библиотеки карт: Leaflet + Google Maps
- Нет code splitting

### После:
- First Load JS: **~85 kB** (-15%)
- Dependencies: **~45** (-12%)
- Одна библиотека карт: только Leaflet
- Code splitting для тяжелых компонентов

---

## Метрики для проверки

Запустить после завершения:
```bash
cd pickom-client
npm run build > build-output.txt
```

Проверить в выводе:
- [ ] First Load JS < 90 kB
- [ ] @googlemaps отсутствует в bundle
- [ ] @mui/x-data-grid отсутствует в bundle
- [ ] DualLocationPicker в отдельном chunk'е
- [ ] Все страницы генерируются успешно

---

## Файлы для изменения

### Конфигурация:
- `pickom-client/package.json` (зависимости)
- `pickom-client/.env` (удалить Google Maps API key)

### Код:
- `app/delivery-methods/page.tsx` (dynamic import)
- `app/available-deliveries/page.tsx` (dynamic import)
- Другие файлы с модалками (опционально)

---

## Следующий шаг
После завершения этой задачи переходить к: **Task 3: PWA Configuration**

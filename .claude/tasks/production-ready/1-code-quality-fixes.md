# Task 1: Code Quality Fixes

**Приоритет:** КРИТИЧНО
**Время:** 2-3 дня
**Блокирует:** Production deployment

## Цель
Исправить все ошибки качества кода: включить проверки TypeScript/ESLint, исправить все ошибки, удалить debug логи.

## Проблема
- TypeScript и ESLint проверки **отключены** при сборке
- **84 ошибки ESLint** в production коде
- **121 console.log** statements по всему проекту
- Билд проходит только потому что проверки игнорируются

## Подзадачи

### 1.1. Включить TypeScript проверки
- [ ] Открыть `pickom-client/next.config.ts`
- [ ] Удалить строку: `typescript: { ignoreBuildErrors: true }`
- [ ] Запустить: `cd pickom-client && npm run build`
- [ ] Если есть ошибки TypeScript - исправить их
- [ ] Убедиться что билд проходит успешно

**Ожидаемый результат:** TypeScript проверки включены, билд проходит без ошибок

---

### 1.2. Включить ESLint проверки
- [ ] Открыть `pickom-client/next.config.ts`
- [ ] Удалить строку: `eslint: { ignoreDuringBuilds: true }`
- [ ] Запустить: `cd pickom-client && npm run build`
- [ ] Перейти к исправлению ESLint ошибок (задачи ниже)

**Ожидаемый результат:** ESLint проверки включены

---

### 1.3. Исправить ошибки `@typescript-eslint/no-explicit-any`

**Проблема:** ~50 ошибок использования `any` типа

**Файлы для исправления:**
- `app/active-delivery/[id]/page.tsx` (4 ошибки)
- `app/api/base.ts` (1 ошибка)
- `app/available-deliveries/page.tsx` (3 ошибки)
- `app/browse-senders/page.tsx` (1 ошибка)
- `app/chat/[id]/ChatPageClient.tsx` (3 ошибки)
- `app/chats/page.tsx` (1 ошибка)
- `app/delivery-details/[id]/page.tsx` (2 ошибки)
- И еще ~30 файлов

**Шаги:**
- [ ] Для error handling заменить `catch (err: any)` на `catch (err: unknown)`
- [ ] Добавить type guard для проверки ошибок:
  ```typescript
  catch (err: unknown) {
    const error = err as Error;
    console.error('Error:', error.message);
    // или
    if (err instanceof Error) {
      setError(err.message);
    }
  }
  ```
- [ ] Для API responses создать правильные типы вместо `any`
- [ ] Запустить: `npm run lint` после исправления каждых 10 файлов
- [ ] Проверить что ошибки `no-explicit-any` исчезли

**Ожидаемый результат:** 0 ошибок `no-explicit-any`

---

### 1.4. Исправить ошибки `react/no-unescaped-entities`

**Проблема:** 8 ошибок в `app/components/NotificationActions.tsx`

**Файл:** `app/components/NotificationActions.tsx` (строки 115, 124, 133, 142)

**Шаги:**
- [ ] Открыть файл `app/components/NotificationActions.tsx`
- [ ] Найти все строки с неэкранированными кавычками `"`
- [ ] Заменить на одно из:
  - `&quot;` (HTML entity)
  - `'` (одинарные кавычки)
  - `{'"'}` (JSX expression)
- [ ] Пример:
  ```typescript
  // ДО
  "Accept offer"

  // ПОСЛЕ
  'Accept offer'
  // или
  {"Accept offer"}
  ```
- [ ] Запустить: `npm run lint`
- [ ] Проверить что ошибки `no-unescaped-entities` исчезли

**Ожидаемый результат:** 0 ошибок `no-unescaped-entities`

---

### 1.5. Исправить ошибки `@typescript-eslint/no-unused-vars`

**Проблема:** ~15 ошибок неиспользуемых переменных

**Примеры файлов:**
- `app/api/base.ts` (tokenError, response, error)
- `app/available-deliveries/page.tsx` (PersonSearch, savePickerSettings)
- `app/browse-senders/page.tsx` (useCallback)

**Шаги:**
- [ ] Найти все неиспользуемые переменные: `npm run lint | grep "no-unused-vars"`
- [ ] Для каждой переменной выбрать действие:
  - **Удалить** если действительно не нужна
  - **Использовать** если забыли использовать
  - **Переименовать** с underscore если намеренно не используется: `_variableName`
- [ ] Примеры:
  ```typescript
  // ДО
  const { PersonSearch } = require(...);  // не используется

  // ПОСЛЕ - вариант 1: удалить
  // удалена строка

  // ПОСЛЕ - вариант 2: переименовать
  const { PersonSearch: _PersonSearch } = require(...);
  ```
- [ ] Запустить: `npm run lint`
- [ ] Проверить что ошибки `no-unused-vars` исчезли

**Ожидаемый результат:** 0 ошибок `no-unused-vars`

---

### 1.6. Исправить ошибки `react-hooks/exhaustive-deps`

**Проблема:** ~10 ошибок отсутствующих зависимостей в useEffect

**Пример файла:**
- `app/available-deliveries/page.tsx` (строка 124)

**Шаги:**
- [ ] Найти все ошибки: `npm run lint | grep "exhaustive-deps"`
- [ ] Для каждой ошибки выбрать действие:
  - **Добавить зависимость** если она действительно нужна
  - **Добавить комментарий** если намеренно опущена:
    ```typescript
    useEffect(() => {
      // ...
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [someDep]); // Intentionally omitted: otherDep causes infinite loop
    ```
  - **Использовать useCallback/useMemo** для стабилизации зависимостей
- [ ] Запустить: `npm run lint`
- [ ] Проверить что ошибки `exhaustive-deps` исчезли

**Ожидаемый результат:** 0 ошибок `exhaustive-deps`

---

### 1.7. Удалить все console.log statements

**Проблема:** 121 console.log по всему проекту (110 в app/, 11 в components/)

**Стратегия:** Либо удалить полностью, либо обернуть в dev-only режим

**Файлы:**
- `app/` директория: 32 файла
- `components/` директория: 5 файлов

**Шаги:**
- [ ] Создать helper функцию для логирования:
  ```typescript
  // lib/logger.ts
  export const logger = {
    log: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(...args);
      }
    },
    error: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(...args);
      }
    },
    warn: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(...args);
      }
    },
  };
  ```
- [ ] Заменить все `console.log` на `logger.log` или удалить
- [ ] Оставить только критичные `console.error` для production
- [ ] Использовать regex для массовой замены:
  - Find: `console\.log\((.*?)\);?`
  - Replace: `// console.log($1);` или удалить
- [ ] Проверить каждый файл из списка:
  - app/notifications/page.tsx
  - app/my-offers/page.tsx
  - app/login/page.tsx
  - app/available-deliveries/page.tsx
  - И остальные 28+ файлов
- [ ] Запустить: `grep -r "console\." pickom-client/app pickom-client/components`
- [ ] Убедиться что осталось 0 или только обернутые в dev режим

**Ожидаемый результат:** 0 production console.log statements

---

### 1.8. Финальная проверка

- [ ] Запустить: `cd pickom-client && npm run lint`
- [ ] Убедиться: **0 errors**
- [ ] Может быть warnings - это OK
- [ ] Запустить: `cd pickom-client && npm run build`
- [ ] Убедиться: билд проходит успешно
- [ ] Запустить: `cd pickom-client && npx tsc --noEmit`
- [ ] Убедиться: 0 TypeScript ошибок

**Ожидаемый результат:**
```
✓ Linting and checking validity of types
✓ Compiled successfully
```

---

## Критерии успеха

### До:
- ❌ 84 ESLint ошибки
- ❌ 121 console.log
- ❌ TypeScript/ESLint проверки отключены
- ❌ Билд проходит только с игнорированием ошибок

### После:
- ✅ 0 ESLint ошибок
- ✅ 0 production console.log
- ✅ TypeScript/ESLint проверки включены
- ✅ Билд проходит чисто

---

## Файлы для изменения

### Конфигурация:
- `pickom-client/next.config.ts`
- `pickom-client/lib/logger.ts` (новый)

### Код (~35 файлов):
- `app/active-delivery/[id]/page.tsx`
- `app/api/base.ts`
- `app/available-deliveries/page.tsx`
- `app/browse-senders/page.tsx`
- `app/chat/[id]/ChatPageClient.tsx`
- `app/chats/page.tsx`
- `app/components/NotificationActions.tsx`
- `app/delivery-details/[id]/page.tsx`
- `app/delivery-methods/[id]/offers/page.tsx`
- `app/delivery-methods/page.tsx`
- `app/earnings/cancelled/page.tsx`
- `app/earnings/completed/page.tsx`
- `app/earnings/page.tsx`
- `app/earnings/top-up/page.tsx`
- `app/earnings/top-up/success/page.tsx`
- `app/hooks/useNotifications.ts`
- `app/login/page.tsx`
- `app/my-offers/page.tsx`
- `app/notifications/page.tsx`
- `app/orders/[id]/edit/page.tsx`
- `app/orders/[id]/offers/page.tsx`
- `app/orders/[id]/page.tsx`
- `app/orders/page.tsx`
- `app/package-type/page.tsx`
- `app/page.tsx`
- `app/picker-results/page.tsx`
- `app/profile/[uid]/page.tsx`
- `app/profile/edit/page.tsx`
- `app/profile/page.tsx`
- `app/rate-picker/[deliveryId]/page.tsx`
- `app/rate-sender/[deliveryId]/page.tsx`
- `app/register/page.tsx`
- `components/chat/TabbedChat.tsx`
- `components/LocationPicker.tsx`
- `components/common/ErrorBoundary.tsx`
- `components/DualLocationPicker.tsx`
- `components/order/ReceiverSelector.tsx`

---

## Следующий шаг
После завершения этой задачи переходить к: **Task 2: Bundle Optimization**

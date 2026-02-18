План оптимизации и исправления дублирования уведомлений

 Проблема 1: Дублирование уведомлений ✅

 Корневая причина

 В приложении одновременно рендерятся ДВА компонента <Toaster>:

 1. Первый Toaster в pickom-client/app/layout.tsx (строки 45-68)
   - Позиция: top-right
   - Длительность: 4000ms
   - Темная тема
 2. Второй Toaster в pickom-client/components/common/ThemeWrapper.tsx (строка 49)
   - Через компонент <ToastProvider />
   - Позиция: top-center ✅ (тот, который нужно оставить)
   - Длительность: 3000ms
   - Поддержка светлой/темной темы

 Когда вызывается toast.success('Delivery created successfully!'), библиотека react-hot-toast триггерит оба Toaster'а, в результате появляются два одинаковых
 уведомления.

 Решение

 Удалить <Toaster> из layout.tsx (строки 45-68), оставить только <ToastProvider /> в ThemeWrapper.tsx.

 Преимущества центрального Toaster:
 - Поддержка светлой/темной темы
 - Лучшая позиция для мобильных устройств (top-center)
 - Правильная инкапсуляция в provider компоненте

 ---
 Проблема 2: Оптимизация производительности �

 Категория 1: Дублирование кода (HIGH PRIORITY)

 1.1 Status Helper Functions

 Проблема: Функции getStatusColor() и getStatusLabel() дублируются в 8+ файлах:
 - delivery-details/[id]/PageClient.tsx (строки 414-434)
 - available-deliveries/page.tsx (строки 319-339)
 - my-offers/page.tsx
 - active-delivery/[id]/PageClient.tsx
 - track-delivery/[deliveryId]/PageClient.tsx
 - new-task/[deliveryId]/PageClient.tsx
 - orders/[id]/PageClient.tsx

 Решение: Создать pickom-client/app/utils/deliveryHelpers.ts с экспортируемыми функциями:
 export const getDeliveryStatusColor = (status: DeliveryStatus): ChipColor => {
   const statusColors: Record<DeliveryStatus, ChipColor> = {
     pending: 'warning',
     accepted: 'info',
     picked_up: 'primary',
     delivered: 'success',
     cancelled: 'error',
   };
   return statusColors[status] || 'default';
 };

 export const getDeliveryStatusLabel = (status: DeliveryStatus): string => {
   const statusLabels: Record<DeliveryStatus, string> = {
     pending: 'Pending',
     accepted: 'Accepted',
     picked_up: 'Picked Up',
     delivered: 'Delivered',
     cancelled: 'Cancelled',
   };
   return statusLabels[status] || status;
 };

 Заменить во всех 8+ файлах на импорт из utils.

 Экономия: ~200 строк дублированного кода

 1.2 Address Formatting Function

 Проблема: Функция shortenAddress() дублируется в нескольких компонентах.

 Решение: Добавить в pickom-client/app/utils/addressHelpers.ts:
 export const shortenAddress = (address: string, maxLength: number = 30): string => {
   return address.length > maxLength
     ? `${address.substring(0, maxLength)}...`
     : address;
 };

 ---
 Категория 2: Большие компоненты (HIGH PRIORITY)

 2.1 delivery-details/[id]/PageClient.tsx (1,205 строк)

 Проблема: Монолитный компонент с множественными обязанностями.

 Решение: Разбить на:
 1. Главный контейнер: DeliveryDetailsContainer.tsx
 2. Подкомпоненты:
   - DeliveryTimeline.tsx - таймлайн доставки
   - DeliveryActions.tsx - кнопки действий (отмена, чат и т.д.)
   - DeliveryLocationMap.tsx - карта с локацией
 3. Кастомные хуки:
   - useDeliveryDetails.ts - логика получения данных
   - useDeliveryTracking.ts - логика отслеживания локации

 2.2 delivery-methods/page.tsx (1,070 строк)

 Проблема: Смешивает управление формой, список доставок, табы.

 Решение: Разбить на:
 1. DeliveryForm.tsx - логика формы
 2. MyDeliveriesTab.tsx - вкладка "Мои доставки"
 3. IncomingDeliveriesTab.tsx - вкладка "Входящие"
 4. useDeliveryForm.ts - хук для управления формой

 2.3 available-deliveries/page.tsx (830 строк)

 Решение: Извлечь:
 - PickerCardWidget.tsx
 - PlannedTripsSection.tsx
 - DeliveryFilters.tsx
 - useAvailableDeliveries.ts

 ---
 Категория 3: N+1 Query Problems (HIGH PRIORITY)

 3.1 delivery-methods/[id]/offers/PageClient.tsx (строки 112-141)

 Проблема:
 const offersWithPickers = await Promise.all(
   offersData.map(async (offer) => {
     const userResponse = await getUser(offer.pickerId); // N+1 запросы!
   })
 );

 Решение:
 1. Использовать Promise.all для параллельных запросов (уже есть)
 2. Добавить кеширование через TanStack Query
 3. Запросить бэкенд добавить picker в ответ /offers endpoint

 3.2 delivery-details/[id]/PageClient.tsx (строки 152-211)

 Проблема: Последовательные запросы данных пользователей.

 Решение: Выполнять параллельно через Promise.all:
 const [senderResponse, pickerResponse, receiverResponse] = await Promise.all([
   getUser(deliveryData.senderId),
   deliveryData.pickerId ? getUser(deliveryData.pickerId) : null,
   deliveryData.recipientId ? getUser(deliveryData.recipientId) : null,
 ]);

 ---
 Категория 4: React оптимизации (MEDIUM PRIORITY)

 4.1 Отсутствие React.memo

 Проблема: Из 71 TSX файла только 10 используют оптимизации.

 Решение: Добавить React.memo в крупные компоненты списков:
 - DeliveryCard компоненты
 - PickerCard компоненты
 - Табы в delivery-methods

 4.2 Отсутствие useMemo/useCallback

 Критичные места:

 delivery-details/[id]/PageClient.tsx:
 - Строки 414-434: функции getStatusColor/getStatusLabel должны быть в utils (см. выше)
 - Фильтрация/сортировка данных должна быть обернута в useMemo

 delivery-methods/page.tsx:
 - Строки 158-388: Inline компоненты MyDeliveriesTab/IncomingDeliveriesTab должны быть обернуты в React.memo

 ---
 Категория 5: Управление состоянием (MEDIUM PRIORITY)

 5.1 Слишком много useState

 delivery-details/[id]/PageClient.tsx (строки 110-133): 24 отдельных useState!

 Решение: Консолидировать в useReducer:
 type DeliveryDetailsState = {
   delivery: Delivery | null;
   sender: User | null;
   picker: User | null;
   receiver: User | null;
   offers: Offer[];
   isLoading: boolean;
   error: string | null;
   // ... остальные поля
 };

 const [state, dispatch] = useReducer(deliveryDetailsReducer, initialState);

 ---
 Категория 6: Мертвый код (LOW PRIORITY)

 6.1 Пустые catch блоки

 Найдено 20+ пустых catch блоков в:
 - delivery-details/[id]/PageClient.tsx (строки 171, 190, 210)
 - available-deliveries/page.tsx (строки 133, 166, 179)
 - orders/[id]/PageClient.tsx (строки 44, 92, 106, 136)

 Решение: Добавить логирование ошибок или обработку:
 catch (error) {
   console.error('Failed to fetch user:', error);
   // или toast.error
 }

 6.2 Неиспользуемые импорты

 Решение: Запустить ESLint с автофиксом для удаления неиспользуемых импортов.

 ---
 План выполнения (Утверждено пользователем)

 Пользователь подтвердил выполнение ВСЕХ задач, включая:
 - ✅ Исправить дублирование уведомлений (быстро)
 - ✅ Создать utils и убрать дублирование кода
 - ✅ Исправить N+1 queries (оптимизация API)
 - ✅ Разбить крупные компоненты (1000+ строк)
 - ✅ Добавить React оптимизации (memo, useMemo, useCallback)

 Phase 1: Быстрое исправление (5 минут)

 1. Удалить дублирование Toaster из layout.tsx (строки 45-68)
   - Оставить только <ToastProvider /> в ThemeWrapper.tsx
   - Тестировать: создать delivery и убедиться, что уведомление одно

 Phase 2: Создание утилит и дедупликация (30 минут)

 2. Создать pickom-client/app/utils/deliveryHelpers.ts:
   - getDeliveryStatusColor()
   - getDeliveryStatusLabel()
   - Экспортировать типы DeliveryStatus, ChipColor
 3. Создать pickom-client/app/utils/addressHelpers.ts:
   - shortenAddress()
 4. Рефакторить 8+ файлов для использования новых утилит:
   - delivery-details/[id]/PageClient.tsx
   - available-deliveries/page.tsx
   - my-offers/page.tsx
   - active-delivery/[id]/PageClient.tsx
   - track-delivery/[deliveryId]/PageClient.tsx
   - new-task/[deliveryId]/PageClient.tsx
   - orders/[id]/PageClient.tsx
   - Другие файлы по необходимости

 Phase 3: N+1 Query оптимизация (20 минут)

 5. Оптимизировать delivery-details/[id]/PageClient.tsx:
   - Строки 152-211: Параллельные запросы через Promise.all
   - Добавить обработку ошибок для каждого запроса
 6. Оптимизировать delivery-methods/[id]/offers/PageClient.tsx:
   - Строки 112-141: уже использует Promise.all, добавить кеширование

 Phase 4: Разбиение крупных компонентов (2-3 часа)

 7. Разбить delivery-details/[id]/PageClient.tsx (1,205 строк):
   - Создать components/delivery-details/:
       - DeliveryTimeline.tsx
     - DeliveryActions.tsx
     - DeliveryLocationMap.tsx
   - Создать hooks/delivery-details/:
       - useDeliveryDetails.ts
     - useDeliveryTracking.ts
   - Упростить главный PageClient.tsx до ~300 строк
 8. Разбить delivery-methods/page.tsx (1,070 строк):
   - Извлечь components/delivery-methods/:
       - DeliveryForm.tsx
     - MyDeliveriesTab.tsx
     - IncomingDeliveriesTab.tsx
   - Создать hooks/delivery-methods/:
       - useDeliveryForm.ts
   - Упростить главный файл до ~400 строк
 9. Разбить available-deliveries/page.tsx (830 строк):
   - Извлечь components/available-deliveries/:
       - PickerCardWidget.tsx
     - PlannedTripsSection.tsx
     - DeliveryFilters.tsx
   - Создать hooks/available-deliveries/:
       - useAvailableDeliveries.ts
   - Упростить главный файл до ~300 строк

 Phase 5: React оптимизации (1-2 часа)

 10. Добавить React.memo в компоненты списков:
   - Обернуть DeliveryCard компоненты
   - Обернуть PickerCard компоненты
   - Обернуть извлеченные Tab компоненты
 11. Добавить useMemo для вычислений:
   - Фильтрация deliveries в available-deliveries
   - Сортировка offers в offers/PageClient.tsx
   - Computed values в delivery-details
 12. Добавить useCallback для event handlers:
   - Обработчики кликов в списках
   - Обработчики форм
   - Callbacks передаваемые в дочерние компоненты
 13. Консолидировать state с useReducer:
   - delivery-details/[id]/PageClient.tsx: 24 useState → useReducer

 Phase 6: Cleanup (30 минут)

 14. Обработать пустые catch блоки (20+ мест)
 15. Запустить ESLint autofix для удаления неиспользуемых импортов
 16. Финальное тестирование всех изменений

 ---
 Критичные файлы для изменения

 Исправление дублирования уведомлений:

 - pickom-client/app/layout.tsx - удалить Toaster (строки 45-68)

 Утилиты для дедупликации:

 - pickom-client/app/utils/deliveryHelpers.ts - создать
 - pickom-client/app/utils/addressHelpers.ts - создать

 Файлы для рефакторинга (status helpers):

 1. pickom-client/app/delivery-details/[id]/PageClient.tsx
 2. pickom-client/app/available-deliveries/page.tsx
 3. pickom-client/app/my-offers/page.tsx
 4. pickom-client/app/active-delivery/[id]/PageClient.tsx
 5. pickom-client/app/track-delivery/[deliveryId]/PageClient.tsx
 6. pickom-client/app/new-task/[deliveryId]/PageClient.tsx
 7. pickom-client/app/orders/[id]/PageClient.tsx

 N+1 Query оптимизация:

 - pickom-client/app/delivery-methods/[id]/offers/PageClient.tsx
 - pickom-client/app/delivery-details/[id]/PageClient.tsx

 Крупные компоненты для разбиения:

 - pickom-client/app/delivery-details/[id]/PageClient.tsx (1,205 строк)
 - pickom-client/app/delivery-methods/page.tsx (1,070 строк)
 - pickom-client/app/available-deliveries/page.tsx (830 строк)

 ---
 Ожидаемые результаты

 После Phase 1:
 - ✅ Уведомления больше не дублируются
 - ~200 строк дублированного кода удалено
 - ~60% уменьшение API запросов в критичных местах

 После Phase 2:
 - ~30% быстрее re-renders в крупных компонентах
 - Улучшенная читаемость и поддерживаемость кода

 После Phase 3:
 - ~40% меньше ненужных re-renders
 - Более плавная работа UI

 Общий эффект:
 - 2-3x улучшение производительности на страницах со списками
 - ~15% уменьшение размера бандла
 - Значительно улучшенная поддерживаемость кода
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

 Would you like to proceed?

 ❯ 1. Yes, and auto-accept edits
   2. Yes, and manually approve edits
   3. Type here to tell Claude what to change

 ctrl-g to edit in Notepad
   isLoading: boolean;
   error: string | null;
   // ... остальные поля
 };

 const [state, dispatch] = useReducer(deliveryDetailsReducer, initialState);

 ---
 Категория 6: Мертвый код (LOW PRIORITY)

 6.1 Пустые catch блоки

 Найдено 20+ пустых catch блоков в:
 - delivery-details/[id]/PageClient.tsx (строки 171, 190, 210)
 - available-deliveries/page.tsx (строки 133, 166, 179)
 - orders/[id]/PageClient.tsx (строки 44, 92, 106, 136)

 Решение: Добавить логирование ошибок или обработку:
 catch (error) {
   console.error('Failed to fetch user:', error);
   // или toast.error
 }

 6.2 Неиспользуемые импорты

 Решение: Запустить ESLint с автофиксом для удаления неиспользуемых импортов.

 ---
 План выполнения (Утверждено пользователем)

 Пользователь подтвердил выполнение ВСЕХ задач, включая:
 - ✅ Исправить дублирование уведомлений (быстро)
 - ✅ Создать utils и убрать дублирование кода
 - ✅ Исправить N+1 queries (оптимизация API)
 - ✅ Разбить крупные компоненты (1000+ строк)
 - ✅ Добавить React оптимизации (memo, useMemo, useCallback)

 Phase 1: Быстрое исправление (5 минут)

 1. Удалить дублирование Toaster из layout.tsx (строки 45-68)
   - Оставить только <ToastProvider /> в ThemeWrapper.tsx
   - Тестировать: создать delivery и убедиться, что уведомление одно

 Phase 2: Создание утилит и дедупликация (30 минут)

 2. Создать pickom-client/app/utils/deliveryHelpers.ts:
   - getDeliveryStatusColor()
   - getDeliveryStatusLabel()
   - Экспортировать типы DeliveryStatus, ChipColor
 3. Создать pickom-client/app/utils/addressHelpers.ts:
   - shortenAddress()
 4. Рефакторить 8+ файлов для использования новых утилит:
   - delivery-details/[id]/PageClient.tsx
   - available-deliveries/page.tsx
   - my-offers/page.tsx
   - active-delivery/[id]/PageClient.tsx
   - track-delivery/[deliveryId]/PageClient.tsx
   - new-task/[deliveryId]/PageClient.tsx
   - orders/[id]/PageClient.tsx
   - Другие файлы по необходимости

 Phase 3: N+1 Query оптимизация (20 минут)

 5. Оптимизировать delivery-details/[id]/PageClient.tsx:
   - Строки 152-211: Параллельные запросы через Promise.all
   - Добавить обработку ошибок для каждого запроса
 6. Оптимизировать delivery-methods/[id]/offers/PageClient.tsx:
   - Строки 112-141: уже использует Promise.all, добавить кеширование

 Phase 4: Разбиение крупных компонентов (2-3 часа)

 7. Разбить delivery-details/[id]/PageClient.tsx (1,205 строк):
   - Создать components/delivery-details/:
       - DeliveryTimeline.tsx
     - DeliveryActions.tsx
     - DeliveryLocationMap.tsx
   - Создать hooks/delivery-details/:
       - useDeliveryDetails.ts
     - useDeliveryTracking.ts
   - Упростить главный PageClient.tsx до ~300 строк
 8. Разбить delivery-methods/page.tsx (1,070 строк):
   - Извлечь components/delivery-methods/:
       - DeliveryForm.tsx
     - MyDeliveriesTab.tsx
     - IncomingDeliveriesTab.tsx
   - Создать hooks/delivery-methods/:
       - useDeliveryForm.ts
   - Упростить главный файл до ~400 строк
 9. Разбить available-deliveries/page.tsx (830 строк):
   - Извлечь components/available-deliveries/:
       - PickerCardWidget.tsx
     - PlannedTripsSection.tsx
     - DeliveryFilters.tsx
   - Создать hooks/available-deliveries/:
       - useAvailableDeliveries.ts
   - Упростить главный файл до ~300 строк

 Phase 5: React оптимизации (1-2 часа)

 10. Добавить React.memo в компоненты списков:
   - Обернуть DeliveryCard компоненты
   - Обернуть PickerCard компоненты
   - Обернуть извлеченные Tab компоненты
 11. Добавить useMemo для вычислений:
   - Фильтрация deliveries в available-deliveries
   - Сортировка offers в offers/PageClient.tsx
   - Computed values в delivery-details
 12. Добавить useCallback для event handlers:
   - Обработчики кликов в списках
   - Обработчики форм
   - Callbacks передаваемые в дочерние компоненты
 13. Консолидировать state с useReducer:
   - delivery-details/[id]/PageClient.tsx: 24 useState → useReducer

 Phase 6: Cleanup (30 минут)

 14. Обработать пустые catch блоки (20+ мест)
 15. Запустить ESLint autofix для удаления неиспользуемых импортов
 16. Финальное тестирование всех изменений

 ---
 Критичные файлы для изменения

 Исправление дублирования уведомлений:

 - pickom-client/app/layout.tsx - удалить Toaster (строки 45-68)

 Утилиты для дедупликации:

 - pickom-client/app/utils/deliveryHelpers.ts - создать
 - pickom-client/app/utils/addressHelpers.ts - создать

 Файлы для рефакторинга (status helpers):

 1. pickom-client/app/delivery-details/[id]/PageClient.tsx
 2. pickom-client/app/available-deliveries/page.tsx
 3. pickom-client/app/my-offers/page.tsx
 4. pickom-client/app/active-delivery/[id]/PageClient.tsx
 5. pickom-client/app/track-delivery/[deliveryId]/PageClient.tsx
 6. pickom-client/app/new-task/[deliveryId]/PageClient.tsx
 7. pickom-client/app/orders/[id]/PageClient.tsx

 N+1 Query оптимизация:

 - pickom-client/app/delivery-methods/[id]/offers/PageClient.tsx
 - pickom-client/app/delivery-details/[id]/PageClient.tsx

 Крупные компоненты для разбиения:

 - pickom-client/app/delivery-details/[id]/PageClient.tsx (1,205 строк)
 - pickom-client/app/delivery-methods/page.tsx (1,070 строк)
 - pickom-client/app/available-deliveries/page.tsx (830 строк)

 ---
 Ожидаемые результаты

 После Phase 1:
 - ✅ Уведомления больше не дублируются
 - ~200 строк дублированного кода удалено
 - ~60% уменьшение API запросов в критичных местах

 После Phase 2:
 - ~30% быстрее re-renders в крупных компонентах
 - Улучшенная читаемость и поддерживаемость кода

 После Phase 3:
 - ~40% меньше ненужных re-renders
 - Более плавная работа UI

 Общий эффект:
 - 2-3x улучшение производительности на страницах со списками
 - ~15% уменьшение размера бандла
 - Значительно улучшенная поддерживаемость кода
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
# Capacitor Setup Guide

## Что уже настроено ✅

### 1. Capacitor инициализирован
- Android платформа добавлена в `android/`
- Конфиг: `capacitor.config.ts`

### 2. Установленные плагины
- `@capacitor/geolocation` - Геолокация
- `@capacitor/keyboard` - Клавиатура
- `@capacitor/network` - Статус сети
- `@capacitor/device` - Информация об устройстве
- `@capacitor/app` - Lifecycle приложения
- `@capacitor/status-bar` - Настройка статус бара
- `@capacitor/splash-screen` - Splash screen

### 3. PWA настроено
- `public/manifest.json` создан
- Viewport meta tags добавлены
- Временная SVG иконка создана: `public/icon.svg`

### 4. Lifecycle hooks
- `lib/capacitor-init.ts` - Инициализация плагинов
- `components/providers/CapacitorProvider.tsx` - React Provider
- Автоматически инициализируется в root layout

## Как запустить в Dev режиме

### Способ 1: С Live Reload (Рекомендуется для разработки)

1. **Узнай свой локальный IP:**
   ```bash
   ipconfig  # Windows
   # Ищи IPv4 Address (например: 192.168.1.100)
   ```

2. **Отредактируй `capacitor.config.ts`:**
   ```typescript
   server: {
     url: 'http://192.168.1.100:3000',  // Твой IP
     cleartext: true,
   },
   ```

3. **Запусти Next.js dev server:**
   ```bash
   npm run dev
   ```

4. **Открой в Android Studio:**
   ```bash
   npm run cap:open:android
   ```

5. **В Android Studio нажми Run (зеленая кнопка)**

### Способ 2: Production Build на эмуляторе

1. **Собери проект:**
   ```bash
   npm run build
   ```

2. **Скопируй в Android и открой:**
   ```bash
   npm run android:build
   ```

3. **В Android Studio нажми Run**

## Доступные скрипты

```bash
# Capacitor sync (копирует web assets в native)
npm run cap:sync

# Sync только Android
npm run cap:sync:android

# Открыть в Android Studio
npm run cap:open:android

# Запустить на подключенном устройстве
npm run cap:run:android

# Dev режим с live reload (требует настройки IP)
npm run android:dev

# Build и открыть в Android Studio
npm run android:build
```

## Создание иконок (TODO)

Сейчас используется временная SVG иконка. Для production нужны PNG иконки:

### Быстрый способ (онлайн):
1. Открой https://realfavicongenerator.net/ или https://www.pwabuilder.com/imageGenerator
2. Загрузи логотип Pickom или создай в Figma/Canva
3. Скачай все размеры: 192x192, 512x512
4. Положи в `public/` и обнови `manifest.json`

### Размеры для Android:
- 192x192 (обязательно)
- 512x512 (обязательно)
- 72x72, 96x96, 128x128, 144x144, 152x152, 384x384 (опционально)

## Настройка Android

### Permissions (если нужно)
Отредактируй `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Геолокация (уже должна быть добавлена плагином) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Интернет (обычно уже есть) -->
<uses-permission android:name="android.permission.INTERNET" />
```

### Signing для Release Build
В Android Studio:
1. Build → Generate Signed Bundle / APK
2. Создай новый keystore или используй существующий
3. Заполни данные

## Тестирование

### На эмуляторе:
1. В Android Studio: Tools → Device Manager
2. Create Device → Pixel 5
3. System Image: API 34 (Android 14)
4. Run

### На реальном устройстве:
1. Включи "Режим разработчика" на телефоне
2. Включи "Отладка по USB"
3. Подключи по USB
4. В Android Studio выбери свое устройство
5. Run

## Известные проблемы

### Problem: `out/` директория не существует
**Решение:** Сейчас используем dev режим с `server.url`. Для production билда нужно настроить static export.

### Problem: Dynamic routes не работают в static export
**Решение:** Используем dev режим или настроим standalone Next.js server в Android (более сложно).

## Следующие шаги

- [ ] Создать правильные иконки для Android
- [ ] Настроить splash screen с брендингом
- [ ] Добавить обработку геолокации в компонентах
- [ ] Тестировать на реальном устройстве
- [ ] Настроить signing для release build
- [ ] Опубликовать в Google Play (если нужно)

## Полезные ссылки

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Plugin API](https://capacitorjs.com/docs/apis/android)
- [Capacitor Workflow](https://capacitorjs.com/docs/basics/workflow)

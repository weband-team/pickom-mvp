# Task 4: Capacitor Production Setup

**Приоритет:** КРИТИЧНО
**Время:** 1 день
**Зависит от:** Task 3 (PWA Configuration)

## Цель
Создать отдельные конфигурации для development и production режимов Capacitor, настроить static export для production.

## Проблема
- Текущая конфигурация только для development (dev server)
- `capacitor.config.ts` указывает на `http://10.0.2.2:3000`
- Нет production build для Capacitor
- `webDir: 'out'` но `output: 'export'` отключен
- Dynamic routes не поддерживаются в static export

## Подзадачи

### 4.1. Создать development конфигурацию

**Шаги:**

- [ ] 4.1.1. Переименовать текущий config в dev версию
  ```bash
  cd pickom-client
  cp capacitor.config.ts capacitor.config.dev.ts
  ```

- [ ] 4.1.2. Обновить `capacitor.config.dev.ts`
  ```typescript
  import type { CapacitorConfig } from '@capacitor/cli';

  const config: CapacitorConfig = {
    appId: 'pickom.io',
    appName: 'Pickom Dev',
    webDir: 'out', // Даже в dev режиме используем out для консистентности

    // Development server configuration
    server: {
      // Android emulator
      url: 'http://10.0.2.2:3000',
      cleartext: true,
      // Для реального устройства используйте:
      // url: 'http://[YOUR_IP]:3000',
    },

    // Android specific configuration
    android: {
      allowMixedContent: true,
      // Dev build type
      buildOptions: {
        signingType: 'debug',
      },
    },

    // Plugins configuration
    plugins: {
      SplashScreen: {
        launchShowDuration: 2000,
        backgroundColor: '#FF9500',
        androidScaleType: 'CENTER_CROP',
        showSpinner: false,
      },
    },
  };

  export default config;
  ```

**Ожидаемый результат:** Development конфигурация создана

---

### 4.2. Создать production конфигурацию

**Шаги:**

- [ ] 4.2.1. Создать `capacitor.config.prod.ts`
  ```typescript
  import type { CapacitorConfig } from '@capacitor/cli';

  const config: CapacitorConfig = {
    appId: 'pickom.io',
    appName: 'Pickom',
    webDir: 'out',

    // NO server configuration for production
    // App will use static files from webDir

    // Android specific configuration
    android: {
      // Production build type
      buildOptions: {
        signingType: 'release',
      },
    },

    // iOS specific configuration (для будущего)
    ios: {
      contentInset: 'automatic',
    },

    // Plugins configuration
    plugins: {
      SplashScreen: {
        launchShowDuration: 2000,
        backgroundColor: '#FF9500',
        androidScaleType: 'CENTER_CROP',
        showSpinner: false,
      },
    },
  };

  export default config;
  ```

**Ожидаемый результат:** Production конфигурация создана

---

### 4.3. Настроить Next.js для static export

**Проблема:** Dynamic routes не поддерживаются в `output: 'export'` без `generateStaticParams()`

**Решение:** Создать условный export только для production builds Capacitor

**Шаги:**

- [ ] 4.3.1. Обновить `next.config.ts`
  ```typescript
  import type { NextConfig } from "next";
  const withPWA = require('./next-pwa.config.js');

  const isCapacitorProd = process.env.CAPACITOR_BUILD === 'production';

  const nextConfig: NextConfig = {
    // Conditional static export for Capacitor production
    ...(isCapacitorProd ? { output: 'export' } : {}),

    // Disable image optimization (needed for Capacitor)
    images: {
      unoptimized: true,
    },

    // Trailing slash for better routing
    trailingSlash: true,

    // Build-time configuration
    distDir: isCapacitorProd ? 'out' : '.next',
  };

  export default withPWA(nextConfig);
  ```

- [ ] 4.3.2. Создать fallback для dynamic routes
  - Dynamic routes будут работать через client-side routing
  - Next.js автоматически создаст 404.html для fallback

**Ожидаемый результат:** Next.js настроен для conditional export

---

### 4.4. Реализовать generateStaticParams для критичных dynamic routes

**Примечание:** Это опциональная оптимизация. Можно пропустить если client-side routing достаточно.

**Критичные dynamic routes:**
- `/orders/[id]` - детали заказа
- `/delivery-details/[id]` - детали доставки
- `/chat/[id]` - чат
- `/profile/[uid]` - профиль пользователя

**Решение:** Пока пропустить, использовать client-side routing

**Шаги (опционально для будущего):**

- [ ] 4.4.1. Добавить generateStaticParams в `/orders/[id]/page.tsx`
  ```typescript
  export async function generateStaticParams() {
    // В production это можно загрузить из API
    // Для сейчас - пустой массив (все routes будут client-side)
    return [];
  }
  ```

**Ожидаемый результат:** Пропущено (client-side routing достаточно)

---

### 4.5. Обновить package.json scripts

**Шаги:**

- [ ] 4.5.1. Открыть `pickom-client/package.json`
- [ ] 4.5.2. Обновить scripts секцию:
  ```json
  {
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "build:fast": "next build --no-lint",
      "start": "next start",
      "lint": "next lint",

      "storybook": "storybook dev -p 6006",
      "build-storybook": "storybook build",

      "cap:sync": "npx cap sync",

      "cap:config:dev": "cp capacitor.config.dev.ts capacitor.config.ts",
      "cap:config:prod": "cp capacitor.config.prod.ts capacitor.config.ts",

      "cap:sync:dev": "npm run cap:config:dev && npx cap sync",
      "cap:sync:prod": "npm run cap:config:prod && npx cap sync",

      "cap:open:android": "npx cap open android",
      "cap:run:android": "npx cap run android",

      "android:dev": "npm run cap:sync:dev && npx cap run android --livereload --external",

      "android:build": "CAPACITOR_BUILD=production npm run build && npm run cap:sync:prod && npx cap open android",

      "android:prod": "CAPACITOR_BUILD=production npm run build && npm run cap:sync:prod && npx cap open android"
    }
  }
  ```

- [ ] 4.5.3. Для Windows создать отдельные scripts (если нужно):
  ```json
  {
    "scripts": {
      "android:build:win": "set CAPACITOR_BUILD=production && npm run build && npm run cap:sync:prod && npx cap open android",
      "android:prod:win": "set CAPACITOR_BUILD=production && npm run build && npm run cap:sync:prod && npx cap open android"
    }
  }
  ```

**Ожидаемый результат:** Scripts настроены для dev и prod

---

### 4.6. Обновить .gitignore

**Шаги:**

- [ ] 4.6.1. Открыть `.gitignore`
- [ ] 4.6.2. Добавить:
  ```
  # Capacitor config (generated from dev/prod versions)
  pickom-client/capacitor.config.ts

  # Static export output
  pickom-client/out/
  ```

- [ ] 4.6.3. Удалить capacitor.config.ts из git tracking (если tracked):
  ```bash
  git rm --cached pickom-client/capacitor.config.ts
  ```

**Ожидаемый результат:** Generated config не в git

---

### 4.7. Создать документацию для билдов

**Шаги:**

- [ ] 4.7.1. Создать `pickom-client/CAPACITOR_BUILD.md`
  ```markdown
  # Capacitor Build Guide

  ## Development Build

  ### With Live Reload (Android Emulator):
  ```bash
  npm run android:dev
  ```

  This will:
  1. Copy `capacitor.config.dev.ts` to `capacitor.config.ts`
  2. Sync Capacitor files
  3. Run app on emulator with live reload from http://10.0.2.2:3000

  ### With Live Reload (Real Device):
  1. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  2. Update `capacitor.config.dev.ts`:
     ```typescript
     server: {
       url: 'http://[YOUR_IP]:3000',
       cleartext: true,
     }
     ```
  3. Run: `npm run android:dev`

  ## Production Build

  ### Build for Production:
  ```bash
  npm run android:prod
  ```

  This will:
  1. Set `CAPACITOR_BUILD=production`
  2. Run Next.js static export: `npm run build`
  3. Copy `capacitor.config.prod.ts` to `capacitor.config.ts`
  4. Sync static files to Capacitor
  5. Open Android Studio for final APK build

  ### Build APK in Android Studio:
  1. In Android Studio: Build → Generate Signed Bundle / APK
  2. Select APK
  3. Choose keystore (create if first time)
  4. Select "release" build variant
  5. Build APK

  ## Troubleshooting

  ### App shows blank screen:
  - Check `android/app/src/main/assets/public` has all files
  - Clear app data on device
  - Rebuild: `npm run cap:sync:prod`

  ### Live reload not working:
  - Check dev server is running: `npm run dev`
  - Check IP is correct in capacitor.config.dev.ts
  - Check device and computer on same network
  - Check firewall allows port 3000

  ### Dynamic routes not working:
  - This is expected in production build
  - App uses client-side routing
  - Ensure you navigate from app (not direct URL)
  ```

**Ожидаемый результат:** Документация создана

---

### 4.8. Тестировать Development Build

**Шаги:**

- [ ] 4.8.1. Запустить dev сервер
  ```bash
  cd pickom-client
  npm run dev
  ```

- [ ] 4.8.2. В новом терминале запустить Android dev build
  ```bash
  npm run android:dev
  ```

- [ ] 4.8.3. Проверить что:
  - ✅ Android Studio открылся
  - ✅ App запустился на эмуляторе
  - ✅ App подключен к dev серверу (hot reload работает)
  - ✅ Изменения в коде отражаются сразу

- [ ] 4.8.4. Проверить основные функции:
  - Навигация между страницами
  - Авторизация
  - Карты работают
  - API запросы проходят

**Ожидаемый результат:** Dev build работает с hot reload

---

### 4.9. Тестировать Production Build

**Шаги:**

- [ ] 4.9.1. Запустить production build
  ```bash
  cd pickom-client
  npm run android:prod
  ```

- [ ] 4.9.2. Дождаться завершения:
  - Next.js static export
  - Capacitor sync
  - Android Studio открывается

- [ ] 4.9.3. Проверить в `android/app/src/main/assets/public`:
  - ✅ Есть index.html
  - ✅ Есть _next/ директория
  - ✅ Есть все static файлы

- [ ] 4.9.4. В Android Studio запустить app
  - Выбрать устройство/эмулятор
  - Кликнуть "Run"

- [ ] 4.9.5. Проверить что:
  - ✅ App запускается без dev сервера
  - ✅ Все страницы работают
  - ✅ Навигация работает
  - ✅ API запросы работают (если backend доступен)
  - ✅ Dynamic routes работают через client-side routing

- [ ] 4.9.6. Тестировать offline (если PWA настроен):
  - Включить Airplane mode на устройстве
  - Перезапустить app
  - Проверить что ранее посещенные страницы работают

**Ожидаемый результат:** Production build работает как standalone app

---

### 4.10. Создать signed APK для distribution

**Примечание:** Это для финального release, можно пропустить для сейчас

**Шаги (для будущего):**

- [ ] 4.10.1. Создать keystore (один раз):
  ```bash
  keytool -genkey -v -keystore pickom-release.keystore -alias pickom -keyalg RSA -keysize 2048 -validity 10000
  ```

- [ ] 4.10.2. Сохранить keystore в безопасном месте
  - НЕ коммитить в git
  - Сохранить пароли

- [ ] 4.10.3. В Android Studio:
  - Build → Generate Signed Bundle / APK
  - Select APK
  - Choose keystore
  - Select "release" variant
  - Build

- [ ] 4.10.4. APK будет в:
  `android/app/build/outputs/apk/release/app-release.apk`

**Ожидаемый результат:** Signed APK готов для distribution

---

## Критерии успеха

### До:
- ❌ Только dev конфигурация
- ❌ Нет production build
- ❌ Capacitor всегда требует dev сервер
- ❌ Нет static export

### После:
- ✅ Отдельные dev и prod конфигурации
- ✅ Production build с static export
- ✅ App работает standalone (без dev сервера)
- ✅ Scripts автоматизированы
- ✅ Документация создана

---

## Файлы для изменения

### Новые файлы:
- `pickom-client/capacitor.config.dev.ts` (новый)
- `pickom-client/capacitor.config.prod.ts` (новый)
- `pickom-client/CAPACITOR_BUILD.md` (новый)

### Изменяемые файлы:
- `pickom-client/next.config.ts`
- `pickom-client/package.json`
- `.gitignore`

### Generated файлы (не коммитить):
- `pickom-client/capacitor.config.ts` (generated from dev/prod)
- `pickom-client/out/` (static export output)

---

## Следующий шаг
После завершения этой задачи переходить к: **Task 5: Security & Environment**

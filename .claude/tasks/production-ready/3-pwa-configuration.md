# Task 3: PWA Configuration

**Приоритет:** КРИТИЧНО
**Время:** 1 день
**Зависит от:** Task 2 (Bundle Optimization)

## Цель
Настроить Progressive Web App (PWA) с Service Worker для offline режима и кэширования ресурсов.

## Проблема
- ❌ Service Worker отсутствует - PWA не работает offline
- ❌ Нет кэширования ресурсов
- ❌ Приложение не может быть установлено как PWA на некоторых платформах
- ✅ manifest.json есть (но требует доработки)

## Подзадачи

### 3.1. Установить и настроить next-pwa

**Шаги:**

- [ ] 3.1.1. Установить next-pwa
  ```bash
  cd pickom-client
  npm install next-pwa
  npm install -D webpack
  ```

- [ ] 3.1.2. Создать файл конфигурации для PWA
  - Создать `pickom-client/next-pwa.config.js`:
  ```javascript
  const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
          }
        }
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
          }
        }
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-js-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-style-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-data',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:json|xml|csv)$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'static-data-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          if (!isSameOrigin) return false;
          const pathname = url.pathname;
          // Exclude /api/ routes
          if (pathname.startsWith('/api/')) return false;
          return true;
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      }
    ]
  });

  module.exports = withPWA;
  ```

- [ ] 3.1.3. Обновить next.config.ts
  ```typescript
  import type { NextConfig } from "next";
  const withPWA = require('./next-pwa.config.js');

  const nextConfig: NextConfig = {
    // Dev mode - no static export (supports dynamic routes)

    // Disable image optimization (needed for Capacitor)
    images: {
      unoptimized: true,
    },

    // Trailing slash for better routing
    trailingSlash: true,

    // Re-enable checks (from Task 1)
    // eslint: { ignoreDuringBuilds: false },
    // typescript: { ignoreBuildErrors: false },
  };

  export default withPWA(nextConfig);
  ```

**Ожидаемый результат:** next-pwa установлен и настроен

---

### 3.2. Обновить .gitignore для PWA файлов

**Шаги:**

- [ ] 3.2.1. Открыть `.gitignore` в корне проекта
- [ ] 3.2.2. Добавить в секцию PWA files:
  ```
  # PWA files
  pickom-client/public/sw.js
  pickom-client/public/sw.js.map
  pickom-client/public/workbox-*.js
  pickom-client/public/workbox-*.js.map
  ```

**Ожидаемый результат:** Сгенерированные PWA файлы не попадут в git

---

### 3.3. Обновить manifest.json

**Шаги:**

- [ ] 3.3.1. Открыть `pickom-client/public/manifest.json`
- [ ] 3.3.2. Обновить конфигурацию:
  ```json
  {
    "name": "Pickom - People-Powered Delivery",
    "short_name": "Pickom",
    "description": "People-Powered Delivery Service - Send and deliver packages with verified pickers",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "background_color": "#FFFFFF",
    "theme_color": "#FF9500",
    "orientation": "portrait-primary",
    "categories": ["delivery", "logistics", "transportation"],
    "lang": "en",
    "dir": "ltr",
    "icons": [
      {
        "src": "/icon.svg",
        "sizes": "any",
        "type": "image/svg+xml",
        "purpose": "any"
      }
    ]
  }
  ```

- [ ] 3.3.3. Добавить поле для screenshots (опционально):
  ```json
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
  ```

**Ожидаемый результат:** manifest.json обновлен для PWA

---

### 3.4. Добавить PWA meta теги в layout.tsx

**Шаги:**

- [ ] 3.4.1. Открыть `pickom-client/app/layout.tsx`
- [ ] 3.4.2. Проверить что metadata уже содержит:
  ```typescript
  export const metadata: Metadata = {
    title: "Pickom",
    description: "People-Powered Delivery",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Pickom",
    },
    formatDetection: {
      telephone: false,
    },
  };
  ```

- [ ] 3.4.3. Добавить недостающие поля (если нужно):
  ```typescript
  export const metadata: Metadata = {
    title: "Pickom - People-Powered Delivery",
    description: "People-Powered Delivery Service",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent", // Улучшенный стиль
      title: "Pickom",
    },
    formatDetection: {
      telephone: false,
    },
    applicationName: "Pickom",
    keywords: ["delivery", "courier", "package", "shipping"],
  };
  ```

**Ожидаемый результат:** Все PWA meta теги на месте

---

### 3.5. Тестировать PWA в development режиме

**Важно:** PWA отключен в development по дизайну, нужно тестировать в production mode

**Шаги:**

- [ ] 3.5.1. Создать production build
  ```bash
  cd pickom-client
  npm run build
  ```

- [ ] 3.5.2. Проверить что Service Worker создан
  - Проверить наличие файлов:
    - `public/sw.js`
    - `public/workbox-*.js`

- [ ] 3.5.3. Запустить production server
  ```bash
  npm run start
  ```

- [ ] 3.5.4. Открыть в Chrome: `http://localhost:3000`

- [ ] 3.5.5. Открыть DevTools → Application
  - **Service Workers:**
    - Проверить что SW зарегистрирован
    - Status: "activated and is running"
  - **Manifest:**
    - Проверить что manifest загружается
    - Проверить иконки
  - **Cache Storage:**
    - Проверить что есть кэши: pages, static-js-assets, static-style-assets и т.д.

- [ ] 3.5.6. Тестировать offline режим
  - В DevTools → Network → поставить "Offline"
  - Обновить страницу
  - Проверить что страница загружается из кэша
  - Проверить что основные страницы работают offline

- [ ] 3.5.7. Тестировать установку PWA
  - В Chrome адресной строке должна появиться иконка "Install"
  - Кликнуть Install
  - Проверить что приложение установилось
  - Запустить PWA отдельно
  - Проверить что работает как standalone приложение

**Ожидаемый результат:**
- ✅ Service Worker зарегистрирован
- ✅ Offline режим работает
- ✅ PWA можно установить
- ✅ Кэширование работает

---

### 3.6. Оптимизировать Service Worker для Capacitor

**Проблема:** Когда app запущен через Capacitor, Service Worker может конфликтовать

**Шаги:**

- [ ] 3.6.1. Обновить next-pwa.config.js
  - Добавить условие для отключения SW в Capacitor:
  ```javascript
  const withPWA = require('next-pwa')({
    dest: 'public',
    // Disable in development OR in Capacitor native app
    disable: process.env.NODE_ENV === 'development' || process.env.CAPACITOR_PLATFORM,
    register: true,
    skipWaiting: true,
    // ... rest of config
  });
  ```

- [ ] 3.6.2. Добавить проверку в components/providers/CapacitorProvider.tsx
  ```typescript
  useEffect(() => {
    // Unregister service worker in native app
    if (isNative() && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }
  }, []);
  ```

**Ожидаемый результат:** Service Worker не конфликтует с Capacitor

---

### 3.7. Добавить offline fallback страницу

**Шаги:**

- [ ] 3.7.1. Создать `pickom-client/public/offline.html`
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Pickom</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background: #f5f5f5;
        color: #333;
        text-align: center;
        padding: 20px;
      }
      .icon {
        font-size: 64px;
        margin-bottom: 20px;
      }
      h1 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 10px 0;
      }
      p {
        font-size: 16px;
        color: #666;
        margin: 0 0 30px 0;
      }
      button {
        background: #FF9500;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
      }
      button:hover {
        background: #e68600;
      }
    </style>
  </head>
  <body>
    <div class="icon">📡</div>
    <h1>You're offline</h1>
    <p>Please check your internet connection and try again.</p>
    <button onclick="window.location.reload()">Try Again</button>
  </body>
  </html>
  ```

- [ ] 3.7.2. Обновить next-pwa.config.js для fallback:
  ```javascript
  const withPWA = require('next-pwa')({
    // ... existing config
    fallbacks: {
      document: '/offline.html',
    },
  });
  ```

**Ожидаемый результат:** Пользователи видят красивую offline страницу

---

### 3.8. Финальное тестирование PWA

**Шаги:**

- [ ] 3.8.1. Запустить Lighthouse audit
  - Открыть Chrome DevTools → Lighthouse
  - Выбрать "Progressive Web App"
  - Запустить audit
  - **Цель:** PWA score > 90

- [ ] 3.8.2. Проверить все PWA критерии:
  - ✅ Installable
  - ✅ Works offline
  - ✅ Fast and reliable
  - ✅ Responsive design
  - ✅ HTTPS (для production)

- [ ] 3.8.3. Тестировать на мобильном устройстве
  - Запустить production build: `npm run build && npm run start`
  - Получить IP: `ipconfig` (Windows) или `ifconfig` (Mac/Linux)
  - Открыть на телефоне: `http://[your-ip]:3000`
  - Установить PWA через браузер
  - Проверить что работает как native app

**Ожидаемый результат:** PWA полностью функционален

---

## Критерии успеха

### До:
- ❌ Service Worker отсутствует
- ❌ Нет offline режима
- ❌ Нет кэширования
- ❌ PWA score: 0

### После:
- ✅ Service Worker работает
- ✅ Offline режим функционален
- ✅ Ресурсы кэшируются
- ✅ PWA score > 90
- ✅ Можно установить как приложение

---

## Файлы для изменения

### Новые файлы:
- `pickom-client/next-pwa.config.js` (новый)
- `pickom-client/public/offline.html` (новый)

### Изменяемые файлы:
- `pickom-client/next.config.ts`
- `pickom-client/public/manifest.json`
- `pickom-client/app/layout.tsx`
- `pickom-client/components/providers/CapacitorProvider.tsx`
- `.gitignore`

### Генерируемые файлы (не коммитить):
- `pickom-client/public/sw.js`
- `pickom-client/public/sw.js.map`
- `pickom-client/public/workbox-*.js`

---

## Следующий шаг
После завершения этой задачи переходить к: **Task 4: Capacitor Production Setup**

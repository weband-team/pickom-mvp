# Task 7: Advanced Optimizations

**Приоритет:** ОПЦИОНАЛЬНО
**Время:** 2-3 дня
**Зависит от:** Tasks 1-6 completed

## Цель
Дальнейшая оптимизация performance, добавление мониторинга, тестирования и CI/CD.

## Примечание
Эти оптимизации **не критичны** для первого production release. Можно делать постепенно после запуска.

## Подзадачи

### 7.1. Оптимизация изображений

**Текущее состояние:** `images: { unoptimized: true }` (для Capacitor)

**Проблема:** Нужен для Capacitor, но можно оптимизировать статичные изображения

**Шаги:**

- [ ] 7.1.1. Найти все используемые изображения:
  ```bash
  find pickom-client/public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \)
  ```

- [ ] 7.1.2. Конвертировать в WebP (где возможно):
  ```bash
  # Install cwebp
  # Windows: choco install webp
  # Mac: brew install webp

  # Convert images
  for img in *.jpg *.png; do
    cwebp -q 80 $img -o ${img%.*}.webp
  done
  ```

- [ ] 7.1.3. Использовать `<picture>` для fallback:
  ```typescript
  <picture>
    <source srcSet="/image.webp" type="image/webp" />
    <img src="/image.png" alt="Description" />
  </picture>
  ```

- [ ] 7.1.4. Добавить lazy loading для всех изображений:
  ```typescript
  <img loading="lazy" ... />
  ```

**Ожидаемый результат:** Изображения оптимизированы

---

### 7.2. Добавить font optimization

**Шаги:**

- [ ] 7.2.1. Проверить используемые шрифты:
  - Roboto (от MUI)
  - System fonts (от tailwind.config.js)

- [ ] 7.2.2. Настроить `next/font`:
  ```typescript
  // app/layout.tsx
  import { Roboto } from 'next/font/google';

  const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
  });

  export default function RootLayout({ children }) {
    return (
      <html lang="en" className={roboto.className}>
        {/* ... */}
      </html>
    );
  }
  ```

- [ ] 7.2.3. Удалить Google Fonts из MUI theme (если использует)

**Ожидаемый результат:** Шрифты оптимизированы

---

### 7.3. Добавить performance monitoring

**Цель:** Отслеживать производительность в production

**Шаги:**

- [ ] 7.3.1. Установить Web Vitals:
  ```bash
  npm install web-vitals
  ```

- [ ] 7.3.2. Создать `lib/web-vitals.ts`:
  ```typescript
  import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

  function sendToAnalytics(metric: any) {
    // Send to your analytics endpoint
    const body = JSON.stringify(metric);

    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body);
    } else {
      fetch('/api/analytics', {
        body,
        method: 'POST',
        keepalive: true,
      });
    }
  }

  export function reportWebVitals() {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }
  ```

- [ ] 7.3.3. Вызвать в app:
  ```typescript
  // app/layout.tsx
  useEffect(() => {
    if (typeof window !== 'undefined') {
      reportWebVitals();
    }
  }, []);
  ```

**Ожидаемый результат:** Web Vitals собираются

---

### 7.4. Добавить E2E тесты с Playwright

**Шаги:**

- [ ] 7.4.1. Установить Playwright:
  ```bash
  cd pickom-client
  npm install -D @playwright/test
  npx playwright install
  ```

- [ ] 7.4.2. Создать `playwright.config.ts`:
  ```typescript
  import { defineConfig, devices } from '@playwright/test';

  export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
    },

    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
    ],

    webServer: {
      command: 'npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  });
  ```

- [ ] 7.4.3. Создать тесты `e2e/auth.spec.ts`:
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('Authentication', () => {
    test('should show login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('h1')).toContainText('Login');
    });

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Should redirect to home
      await expect(page).toHaveURL('/');
    });
  });
  ```

- [ ] 7.4.4. Добавить скрипты:
  ```json
  {
    "scripts": {
      "test:e2e": "playwright test",
      "test:e2e:ui": "playwright test --ui"
    }
  }
  ```

**Ожидаемый результат:** E2E тесты работают

---

### 7.5. Настроить GitHub Actions CI/CD

**Шаги:**

- [ ] 7.5.1. Создать `.github/workflows/ci.yml`:
  ```yaml
  name: CI

  on:
    pull_request:
      branches: [master, develop]
    push:
      branches: [master, develop]

  jobs:
    test:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
            cache-dependency-path: 'pickom-client/package-lock.json'

        - name: Install dependencies
          working-directory: ./pickom-client
          run: npm ci

        - name: Run linter
          working-directory: ./pickom-client
          run: npm run lint

        - name: Run TypeScript check
          working-directory: ./pickom-client
          run: npx tsc --noEmit

        - name: Build project
          working-directory: ./pickom-client
          run: npm run build

        - name: Run E2E tests
          working-directory: ./pickom-client
          run: npx playwright test
          if: false # Enable when E2E tests are ready

    build-android:
      runs-on: ubuntu-latest
      needs: test

      steps:
        - uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'

        - name: Setup Java
          uses: actions/setup-java@v3
          with:
            distribution: 'temurin'
            java-version: '17'

        - name: Install dependencies
          working-directory: ./pickom-client
          run: npm ci

        - name: Build for Capacitor
          working-directory: ./pickom-client
          run: |
            CAPACITOR_BUILD=production npm run build
            npm run cap:sync:prod

        - name: Build Android
          working-directory: ./pickom-client/android
          run: ./gradlew assembleRelease

        - name: Upload APK
          uses: actions/upload-artifact@v3
          with:
            name: app-release
            path: pickom-client/android/app/build/outputs/apk/release/app-release-unsigned.apk
  ```

- [ ] 7.5.2. Создать `.github/workflows/deploy.yml`:
  ```yaml
  name: Deploy

  on:
    push:
      tags:
        - 'v*'

  jobs:
    deploy:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v3

        # Similar steps as CI
        # + Deploy to Vercel/Netlify
        # + Upload APK to Play Store (with secrets)
  ```

**Ожидаемый результат:** CI/CD настроен

---

### 7.6. Добавить error tracking (Sentry)

**Шаги:**

- [ ] 7.6.1. Установить Sentry:
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard -i nextjs
  ```

- [ ] 7.6.2. Настроить `sentry.client.config.ts`:
  ```typescript
  import * as Sentry from '@sentry/nextjs';

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === 'production',
  });
  ```

- [ ] 7.6.3. Добавить error boundary:
  ```typescript
  // Уже есть в components/common/ErrorBoundary.tsx
  // Добавить Sentry.captureException() в componentDidCatch
  ```

**Ожидаемый результат:** Ошибки отслеживаются

---

### 7.7. Добавить Bundle Analyzer

**Шаги:**

- [ ] 7.7.1. Установить:
  ```bash
  npm install -D @next/bundle-analyzer
  ```

- [ ] 7.7.2. Обновить `next.config.ts`:
  ```typescript
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });

  const nextConfig = { /* ... */ };

  export default withPWA(withBundleAnalyzer(nextConfig));
  ```

- [ ] 7.7.3. Добавить script:
  ```json
  {
    "scripts": {
      "analyze": "ANALYZE=true npm run build"
    }
  }
  ```

- [ ] 7.7.4. Запустить анализ:
  ```bash
  npm run analyze
  ```

**Ожидаемый результат:** Можно анализировать bundle

---

### 7.8. Code splitting для страниц

**Шаги:**

- [ ] 7.8.1. Проанализировать крупные страницы:
  ```bash
  npm run analyze
  ```

- [ ] 7.8.2. Разбить крупные компоненты на chunks:
  ```typescript
  // Вместо прямого импорта
  import HeavyComponent from './HeavyComponent';

  // Использовать dynamic import
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <Spinner />,
  });
  ```

- [ ] 7.8.3. Оптимизировать MUI imports:
  ```typescript
  // ❌ Плохо - импортирует все
  import { Button, TextField } from '@mui/material';

  // ✅ Хорошо - tree-shakeable
  import Button from '@mui/material/Button';
  import TextField from '@mui/material/TextField';
  ```

**Ожидаемый результат:** Pages оптимизированы

---

### 7.9. Добавить compression

**Примечание:** Обычно делается на уровне сервера (Nginx, Vercel)

**Для Capacitor (опционально):**

- [ ] 7.9.1. Pre-compress статичные файлы:
  ```bash
  # Install zopfli
  npm install -D zopfli

  # Compress
  find out -name "*.js" -o -name "*.css" | xargs gzip -9 -k
  ```

- [ ] 7.9.2. Настроить Android для использования сжатых файлов

**Ожидаемый результат:** Файлы сжаты

---

### 7.10. Lighthouse score optimization

**Цель:** Достичь 90+ на всех метриках

**Шаги:**

- [ ] 7.10.1. Запустить Lighthouse:
  ```bash
  npm run build
  npm run start
  # Open DevTools → Lighthouse → Run audit
  ```

- [ ] 7.10.2. Проверить метрики:
  - **Performance:** 90+
  - **Accessibility:** 90+
  - **Best Practices:** 90+
  - **SEO:** 90+
  - **PWA:** 90+

- [ ] 7.10.3. Исправить найденные проблемы:
  - Добавить alt тексты для изображений
  - Увеличить контрастность цветов
  - Добавить aria-labels
  - Оптимизировать LCP (Largest Contentful Paint)
  - Уменьшить CLS (Cumulative Layout Shift)

**Ожидаемый результат:** Lighthouse score 90+

---

## Критерии успеха

### До:
- Bundle: 101 kB
- Нет мониторинга
- Нет E2E тестов
- Нет CI/CD
- Lighthouse: ~75

### После:
- Bundle: ~85 kB (-15%)
- Performance monitoring работает
- E2E тесты покрывают критичные flow
- CI/CD автоматизирует проверки
- Lighthouse score: 90+

---

## Приоритизация подзадач

### Высокий приоритет:
1. Bundle Analyzer (7.7) - понять что можно оптимизировать
2. Code splitting (7.8) - реальное уменьшение bundle
3. Lighthouse optimization (7.10) - улучшение UX

### Средний приоритет:
4. CI/CD (7.5) - автоматизация
5. E2E тесты (7.4) - качество
6. Performance monitoring (7.3) - метрики

### Низкий приоритет:
7. Image optimization (7.1)
8. Font optimization (7.2)
9. Error tracking (7.6)
10. Compression (7.9)

---

## Файлы для создания/изменения

### Новые файлы:
- `lib/web-vitals.ts`
- `playwright.config.ts`
- `e2e/*.spec.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `sentry.client.config.ts`
- `sentry.server.config.ts`

### Изменяемые файлы:
- `next.config.ts`
- `package.json`
- `app/layout.tsx`

---

## Следующий шаг
После завершения всех задач (1-7), проект полностью готов к production!

**Final Checklist:**
- [ ] Code Quality ✅
- [ ] Bundle Optimization ✅
- [ ] PWA Configuration ✅
- [ ] Capacitor Production ✅
- [ ] Security & Environment ✅
- [ ] PWA Icons & Assets ✅
- [ ] Advanced Optimizations ✅

**Ready for launch! 🚀**

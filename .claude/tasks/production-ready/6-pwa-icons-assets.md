# Task 6: PWA Icons & Assets

**Приоритет:** ВАЖНО
**Время:** 0.5 дня
**Зависит от:** Task 5 (Security & Environment)

## Цель
Создать полный набор иконок для PWA в разных размерах и форматах для максимальной совместимости.

## Проблема
- ✅ Есть `icon.svg` но этого недостаточно
- ❌ Нет PNG иконок (не все браузеры поддерживают SVG)
- ❌ Нет maskable иконок для Android
- ❌ Нет Apple touch icon
- ❌ Нет favicon

## Подзадачи

### 6.1. Подготовить исходную иконку

**Текущее состояние:** Есть `public/icon.svg`

**Шаги:**

- [ ] 6.1.1. Проверить существующую иконку
  - Открыть `pickom-client/public/icon.svg`
  - Убедиться что размер 512x512px или больше
  - Убедиться что design выглядит хорошо

- [ ] 6.1.2. Если нужно создать новую иконку:
  - Использовать Figma, Adobe Illustrator или Inkscape
  - Размер: 512x512px
  - Цвет фона: #FF9500 (brand color)
  - Простой, узнаваемый дизайн
  - Экспортировать как SVG

- [ ] 6.1.3. Подготовить мастер-версию для PNG экспорта
  - Размер: 1024x1024px (для лучшего качества)
  - Формат: PNG с прозрачностью

**Ожидаемый результат:** Исходная иконка готова

---

### 6.2. Сгенерировать PNG иконки

**Необходимые размеры для PWA:**
- 72x72 (ldpi)
- 96x96 (mdpi)
- 128x128 (hdpi)
- 144x144 (xhdpi)
- 152x152 (xxhdpi)
- 192x192 (xxxhdpi) - **обязательно для PWA**
- 384x384 (xxxxhdpi)
- 512x512 (xxxxxhdpi) - **обязательно для PWA**

**Способ 1: Онлайн генератор (быстрый):**

- [ ] 6.2.1. Использовать онлайн tool:
  - https://realfavicongenerator.net/
  - https://www.pwabuilder.com/imageGenerator
  - Загрузить icon.svg или PNG версию
  - Скачать generated иконки

**Способ 2: Вручную (если нужен контроль):**

- [ ] 6.2.2. Использовать ImageMagick:
  ```bash
  # Install ImageMagick first
  # Windows: choco install imagemagick
  # Mac: brew install imagemagick

  cd pickom-client/public

  # Convert from SVG or master PNG
  convert icon.svg -resize 72x72 icon-72.png
  convert icon.svg -resize 96x96 icon-96.png
  convert icon.svg -resize 128x128 icon-128.png
  convert icon.svg -resize 144x144 icon-144.png
  convert icon.svg -resize 152x152 icon-152.png
  convert icon.svg -resize 192x192 icon-192.png
  convert icon.svg -resize 384x384 icon-384.png
  convert icon.svg -resize 512x512 icon-512.png
  ```

**Способ 3: Node.js script (автоматизация):**

- [ ] 6.2.3. Создать `scripts/generate-icons.js`:
  ```javascript
  const sharp = require('sharp');
  const fs = require('fs');
  const path = require('path');

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const inputFile = path.join(__dirname, '../pickom-client/public/icon.svg');
  const outputDir = path.join(__dirname, '../pickom-client/public');

  async function generateIcons() {
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon-${size}.png`);

      await sharp(inputFile)
        .resize(size, size)
        .png()
        .toFile(outputFile);

      console.log(`Generated: icon-${size}.png`);
    }

    console.log('All icons generated!');
  }

  generateIcons().catch(console.error);
  ```

- [ ] 6.2.4. Установить зависимости и запустить:
  ```bash
  npm install sharp
  node scripts/generate-icons.js
  ```

**Ожидаемый результат:** PNG иконки сгенерированы

---

### 6.3. Создать maskable иконки

**Что такое maskable icons:**
- Иконки с "safe zone" для Android adaptive icons
- Система может обрезать иконку в разные формы (круг, скругленный квадрат, etc.)

**Шаги:**

- [ ] 6.3.1. Использовать https://maskable.app/
  - Загрузить icon.svg или icon-512.png
  - Увидеть preview с разными масками
  - Убедиться что важные части иконки в safe zone
  - Скачать maskable версию

- [ ] 6.3.2. Сохранить как `icon-maskable-512.png`

- [ ] 6.3.3. Опционально создать другие размеры:
  ```bash
  convert icon-maskable-512.png -resize 192x192 icon-maskable-192.png
  ```

**Ожидаемый результат:** Maskable иконки созданы

---

### 6.4. Создать Apple touch icon

**Требования:**
- Размер: 180x180px
- Формат: PNG
- Без прозрачности (solid background)

**Шаги:**

- [ ] 6.4.1. Создать версию с background:
  ```bash
  # Если иконка имеет прозрачность, добавить белый фон
  convert icon.svg -background white -flatten -resize 180x180 apple-touch-icon.png

  # Или с брендовым цветом #FF9500
  convert icon.svg -background "#FF9500" -flatten -resize 180x180 apple-touch-icon.png
  ```

- [ ] 6.4.2. Сохранить в `public/apple-touch-icon.png`

**Ожидаемый результат:** Apple touch icon создан

---

### 6.5. Создать favicon

**Необходимые размеры:**
- favicon.ico (16x16, 32x32, 48x48 multi-size)
- favicon-16x16.png
- favicon-32x32.png

**Шаги:**

- [ ] 6.5.1. Создать PNG версии:
  ```bash
  cd pickom-client/public
  convert icon.svg -resize 16x16 favicon-16x16.png
  convert icon.svg -resize 32x32 favicon-32x32.png
  convert icon.svg -resize 48x48 favicon-48x48.png
  ```

- [ ] 6.5.2. Создать multi-size .ico файл:
  ```bash
  # Combine into .ico
  convert favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon.ico
  ```

- [ ] 6.5.3. Или использовать онлайн tool:
  - https://realfavicongenerator.net/
  - Загрузить icon.svg
  - Скачать favicon.ico

**Ожидаемый результат:** Favicon созданы

---

### 6.6. Обновить manifest.json

**Шаги:**

- [ ] 6.6.1. Открыть `pickom-client/public/manifest.json`
- [ ] 6.6.2. Обновить icons секцию:
  ```json
  {
    "name": "Pickom - People-Powered Delivery",
    "short_name": "Pickom",
    "description": "People-Powered Delivery Service",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "background_color": "#FFFFFF",
    "theme_color": "#FF9500",
    "orientation": "portrait-primary",
    "icons": [
      {
        "src": "/icon-72.png",
        "sizes": "72x72",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-96.png",
        "sizes": "96x96",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-128.png",
        "sizes": "128x128",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-144.png",
        "sizes": "144x144",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-152.png",
        "sizes": "152x152",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-384.png",
        "sizes": "384x384",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/icon-maskable-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "/icon-maskable-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "/icon.svg",
        "sizes": "any",
        "type": "image/svg+xml",
        "purpose": "any"
      }
    ]
  }
  ```

**Ожидаемый результат:** manifest.json обновлен

---

### 6.7. Обновить layout.tsx с favicon и Apple icon

**Шаги:**

- [ ] 6.7.1. Открыть `pickom-client/app/layout.tsx`
- [ ] 6.7.2. Добавить links в metadata или в <head>:
  ```typescript
  export const metadata: Metadata = {
    title: "Pickom - People-Powered Delivery",
    description: "People-Powered Delivery Service",
    manifest: "/manifest.json",

    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },

    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Pickom",
    },

    // ... rest of metadata
  };
  ```

**Ожидаемый результат:** Favicon и Apple icons подключены

---

### 6.8. Создать splash screens для iOS (опционально)

**Примечание:** Это сложнее и может быть сделано позже

**Требуемые размеры для iOS:**
- iPhone SE: 640×1136
- iPhone 8: 750×1334
- iPhone 8 Plus: 1242×2208
- iPhone 11: 828×1792
- iPhone 11 Pro Max: 1242×2688
- iPhone 12/13: 1170×2532
- iPad: 1536×2048
- iPad Pro 12.9": 2048×2732

**Решение:** Пропустить пока, использовать SplashScreen plugin от Capacitor

**Шаги (для будущего):**

- [ ] 6.8.1. Использовать https://www.pwabuilder.com/ для генерации
- [ ] 6.8.2. Или создать универсальный splash с помощью CSS

**Ожидаемый результат:** Пропущено (будет в будущем)

---

### 6.9. Оптимизировать иконки

**Шаги:**

- [ ] 6.9.1. Оптимизировать PNG иконки:
  ```bash
  # Install pngquant
  # Windows: choco install pngquant
  # Mac: brew install pngquant

  cd pickom-client/public
  pngquant --quality=65-80 --ext .png --force icon-*.png
  pngquant --quality=65-80 --ext .png --force apple-touch-icon.png
  ```

- [ ] 6.9.2. Оптимизировать SVG:
  ```bash
  # Install SVGO
  npm install -g svgo

  svgo icon.svg
  ```

- [ ] 6.9.3. Проверить размеры файлов:
  ```bash
  ls -lh *.png *.svg
  ```

  **Целевые размеры:**
  - icon-192.png: ~5-10KB
  - icon-512.png: ~20-30KB
  - apple-touch-icon.png: ~5-8KB

**Ожидаемый результат:** Иконки оптимизированы

---

### 6.10. Тестировать иконки

**Шаги:**

- [ ] 6.10.1. Запустить production build:
  ```bash
  cd pickom-client
  npm run build
  npm run start
  ```

- [ ] 6.10.2. Проверить в Chrome DevTools:
  - Application → Manifest
  - Проверить что все иконки загружаются
  - Проверить что нет 404 ошибок

- [ ] 6.10.3. Проверить favicon:
  - Открыть `http://localhost:3000`
  - Проверить что favicon отображается в табе браузера

- [ ] 6.10.4. Тестировать Apple touch icon:
  - Открыть на iPhone в Safari
  - "Add to Home Screen"
  - Проверить что иконка правильная

- [ ] 6.10.5. Тестировать Android maskable:
  - Открыть на Android в Chrome
  - "Add to Home Screen"
  - Проверить что adaptive icon работает

- [ ] 6.10.6. Lighthouse audit:
  - DevTools → Lighthouse
  - Run PWA audit
  - Проверить секцию "Icons"
  - **Цель:** Нет ошибок с иконками

**Ожидаемый результат:** Все иконки работают корректно

---

## Критерии успеха

### До:
- ✅ Только icon.svg
- ❌ Нет PNG иконок
- ❌ Нет maskable иконок
- ❌ Нет Apple touch icon
- ❌ Нет favicon

### После:
- ✅ Полный набор PNG иконок (72-512px)
- ✅ Maskable иконки для Android
- ✅ Apple touch icon 180x180
- ✅ Favicon (16x16, 32x32, .ico)
- ✅ manifest.json обновлен
- ✅ Все иконки оптимизированы
- ✅ Lighthouse audit проходит

---

## Файлы для создания

### Иконки в `pickom-client/public/`:
- `icon-72.png`
- `icon-96.png`
- `icon-128.png`
- `icon-144.png`
- `icon-152.png`
- `icon-192.png` ← **обязательно для PWA**
- `icon-384.png`
- `icon-512.png` ← **обязательно для PWA**
- `icon-maskable-192.png`
- `icon-maskable-512.png`
- `apple-touch-icon.png`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon.ico`

### Изменяемые файлы:
- `pickom-client/public/manifest.json`
- `pickom-client/app/layout.tsx`

### Опционально:
- `scripts/generate-icons.js` (для автоматизации)

---

## Инструменты

### Онлайн:
- https://realfavicongenerator.net/ - Favicon generator
- https://www.pwabuilder.com/imageGenerator - PWA icons
- https://maskable.app/ - Maskable icon editor

### CLI:
- ImageMagick - Универсальная конвертация
- sharp (Node.js) - Программная генерация
- pngquant - PNG оптимизация
- svgo - SVG оптимизация

---

## Следующий шаг
После завершения этой задачи переходить к: **Task 7: Advanced Optimizations** (опционально)

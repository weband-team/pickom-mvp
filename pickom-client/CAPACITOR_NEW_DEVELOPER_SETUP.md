# Настройка Capacitor проекта для нового разработчика

Полная инструкция по запуску проекта Pickom на твоем компьютере.

---

## Предварительные требования

### 1. Установи необходимое ПО

- **Node.js** (v18+): https://nodejs.org/
- **Git**: https://git-scm.com/
- **Android Studio**: https://developer.android.com/studio
- **JDK 17**: Обычно идет с Android Studio

### 2. Настрой Android Studio

После установки:
1. Открой Android Studio
2. Перейди: **Settings → Languages & Frameworks → Android SDK**
3. Установи:
   - Android SDK Platform (API 34 или выше)
   - Android SDK Build-Tools
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM) - для Windows

4. Создай эмулятор:
   - Tools → Device Manager → Create Device
   - Выбери Pixel 5 или подобное
   - System Image: API 34 (Android 14)

### 3. Добавь Android SDK в PATH

**Windows:**
1. Открой "Редактирование системных переменных среды"
2. В "Переменные среды" добавь в PATH:
   ```
   C:\Users\<ТВОЙ_ЮЗЕР>\AppData\Local\Android\Sdk\platform-tools
   ```
3. Перезапусти терминал

Проверь:
```bash
adb --version
```

---

## Установка проекта

### Шаг 1: Клонируй репозиторий

```bash
git clone https://github.com/weband-team/pickom-mvp.git
cd pickom-mvp
```

### Шаг 2: Переключись на нужную ветку

```bash
git checkout capacitor-tracking
```

### Шаг 3: Установи зависимости

**Client (Next.js):**
```bash
cd pickom-client
npm install
```

**Server (NestJS):**
```bash
cd ../pickom-server
npm install
```

---

## Настройка переменных окружения

### Client (.env)

Создай файл `pickom-client/.env`:

```bash
# API Server URLs
# NEXT_PUBLIC_API_URL - Primary API URL (set to production URL for production builds)
# NEXT_PUBLIC_SERVER - Fallback API URL for development
# Browser will use NEXT_PUBLIC_API_URL or NEXT_PUBLIC_SERVER
# Mobile: 10.0.2.2 for emulator, or your computer's IP for real device

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SERVER=http://localhost:4242
NEXT_PUBLIC_SERVER_MOBILE=http://10.0.2.2:4242

# Firebase Configuration (получи у владельца проекта)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDiclg8XNo2L1hDBoaSoHmFMBggUKYjHH4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pickom-mvp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pickom-mvp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pickom-mvp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=168767828055
NEXT_PUBLIC_FIREBASE_APP_ID=1:168767828055:web:2853961b44970c114ab312
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-V1HMPS55XY
```

### Server (.env)

Создай файл `pickom-server/.env`:

```bash
# Database (получи у владельца проекта)
DATABASE_URL=postgresql://...

# Firebase Admin (получи JSON файл у владельца)
FIREBASE_PROJECT_ID=pickom-mvp
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@pickom-mvp.iam.gserviceaccount.com

# Other
CLIENT_URI=http://localhost:3000
PORT=4242
```

**ВАЖНО:** Попроси у владельца проекта:
- Firebase Admin SDK JSON файл
- Database URL

---

## Настройка IP адреса для мобильного устройства

### Шаг 1: Узнай свой локальный IP

**Windows:**
```bash
ipconfig
```

Ищи строку **IPv4 Address**:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.XXX
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Шаг 2: Обнови .env для мобильного

Измени `pickom-client/.env`:

```bash
# Замени 10.0.2.2 на свой IP если тестируешь на реальном устройстве
NEXT_PUBLIC_SERVER_MOBILE=http://192.168.1.XXX:4242
```

- `10.0.2.2` - для эмулятора Android
- `192.168.1.XXX` - для реального телефона (твой IP)

### Шаг 3: Обнови capacitor.config.ts

Открой `pickom-client/capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'pickom.io',
  appName: 'Pickom',
  webDir: 'out',

  server: {
    // Для эмулятора:
    // url: 'http://10.0.2.2:3000',

    // Для реального телефона - ЗАМЕНИ НА СВОЙ IP:
    url: 'http://192.168.1.XXX:3000',
    cleartext: true,
  },

  android: {
    allowMixedContent: true,
  },

  // ...
};
```

---

## Запуск проекта

### Режим разработки (Dev Mode)

**1. Запусти backend сервер:**
```bash
cd pickom-server
npm run start:dev
```
Сервер запустится на http://localhost:4242

**2. В новом терминале запусти frontend:**
```bash
cd pickom-client
npm run dev
```
Клиент запустится на http://localhost:3000

**3. Синхронизируй Capacitor:**
```bash
npx cap sync android
```

**4. Открой в Android Studio:**
```bash
npx cap open android
```

**5. Запусти на эмуляторе/устройстве:**
- Выбери устройство в выпадающем меню сверху
- Нажми зеленую кнопку ▶ (Run)

### Production Build

Если хочешь собрать автономный APK:

```bash
# 1. Закомментируй server.url в capacitor.config.ts

# 2. Собери проект
cd pickom-client
npm run build

# 3. Синхронизируй
npx cap sync android

# 4. Открой Android Studio и собери APK
npx cap open android
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

## Структура проекта

```
pickom-mvp/
├── pickom-client/           # Next.js frontend
│   ├── android/             # Capacitor Android проект
│   ├── app/                 # Next.js pages
│   ├── components/          # React компоненты
│   ├── out/                 # Static export (после build)
│   ├── capacitor.config.ts  # Настройки Capacitor
│   └── .env                 # Переменные окружения
│
├── pickom-server/           # NestJS backend
│   ├── src/                 # Исходный код
│   └── .env                 # Переменные окружения
│
└── CLAUDE.md               # Инструкции для разработки
```

---

## Тестирование на реальном устройстве

### Подготовка телефона

1. **Включи режим разработчика:**
   - Настройки → О телефоне
   - Тапни 7 раз на "Номер сборки"

2. **Включи отладку по USB:**
   - Настройки → Для разработчиков → Отладка по USB ✅

3. Подключи телефон к компьютеру по USB

4. При запросе на телефоне - разреши отладку

### Проверка подключения

```bash
adb devices
```

Должен увидеть свое устройство:
```
List of devices attached
XXXXX123    device
```

### Важно для реального устройства

- Телефон и компьютер должны быть в **одной WiFi сети**
- Используй свой **локальный IP** вместо `10.0.2.2`
- Проверь что порты 3000 и 4242 не блокируются файрволом

---

## Частые проблемы

### 1. "ERR_CONNECTION_REFUSED" в приложении

**Причина:** Приложение не может подключиться к dev серверу.

**Решение:**
- Проверь что `npm run dev` и `npm run start:dev` запущены
- Проверь IP в `capacitor.config.ts`
- Проверь что телефон в той же WiFi сети
- Попробуй открыть `http://твой_ip:3000` в браузере телефона

### 2. "out/ directory not found"

**Причина:** Нет static export.

**Решение:**
```bash
npm run build
```

Или используй dev режим с `server.url` в конфиге.

### 3. Firebase ошибки

**Причина:** Неправильные/отсутствующие Firebase credentials.

**Решение:**
- Проверь `.env` файлы
- Попроси актуальные credentials у владельца проекта

### 4. Белый экран в приложении

**Решение для отладки:**
1. Подключи телефон по USB
2. Открой Chrome на ПК
3. Перейди на `chrome://inspect/#devices`
4. Найди свое устройство и нажми "inspect"
5. Смотри console на ошибки

### 5. Android Studio не видит устройство

**Решение:**
- Переподключи USB кабель
- Установи драйвера для своего телефона
- Проверь что включена "Отладка по USB"
- Перезапусти adb: `adb kill-server && adb start-server`

### 6. Gradle build failed

**Решение:**
1. В Android Studio: File → Invalidate Caches → Invalidate and Restart
2. Или удали папки и пересобери:
```bash
cd pickom-client/android
rm -rf .gradle build app/build
cd ..
npx cap sync android
```

---

## Полезные команды

```bash
# Capacitor
npx cap sync android          # Копировать web assets в Android
npx cap open android          # Открыть в Android Studio
npx cap run android           # Запустить на подключенном устройстве

# ADB
adb devices                   # Список подключенных устройств
adb logcat                    # Логи Android
adb install app.apk           # Установить APK

# Next.js
npm run dev                   # Dev server
npm run build                 # Production build
npm run lint                  # Проверка кода

# NestJS
npm run start:dev             # Dev server с watch
npm run build                 # Сборка
npm run test                  # Тесты
```

---

## Чеклист первого запуска

- [ ] Установил Node.js, Git, Android Studio
- [ ] Настроил Android SDK и создал эмулятор
- [ ] Клонировал репозиторий
- [ ] Установил зависимости (`npm install` в обоих папках)
- [ ] Создал `.env` файлы с правильными данными
- [ ] Узнал свой локальный IP
- [ ] Обновил `NEXT_PUBLIC_SERVER_MOBILE` в `.env`
- [ ] Обновил `server.url` в `capacitor.config.ts`
- [ ] Запустил backend (`npm run start:dev`)
- [ ] Запустил frontend (`npm run dev`)
- [ ] Синхронизировал Capacitor (`npx cap sync android`)
- [ ] Открыл в Android Studio (`npx cap open android`)
- [ ] Запустил на эмуляторе/устройстве

---

## Контакты

Если что-то не работает - пиши владельцу проекта. Удачи!

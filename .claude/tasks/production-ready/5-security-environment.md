# Task 5: Security & Environment

**Приоритет:** ВАЖНО
**Время:** 0.5 дня
**Зависит от:** Task 4 (Capacitor Production Setup)

## Цель
Обеспечить безопасное управление environment variables и настроить базовую security для Firebase.

## Проблема
- ❌ Нет `.env.example` для других разработчиков
- ⚠️ Firebase credentials в `.env` (это OK для client-side, но нужно настроить Security Rules)
- ⚠️ Hardcoded server URL для dev
- ❌ Нет инструкций по настройке environment

## Подзадачи

### 5.1. Создать .env.example

**Шаги:**

- [ ] 5.1.1. Создать `pickom-client/.env.example`
  ```env
  # ==============================================
  # Pickom Client Environment Variables
  # ==============================================
  # Copy this file to .env and fill in your values
  # DO NOT commit .env to git!

  # ----------------------------------------------
  # API Server URLs
  # ----------------------------------------------
  # For browser: always localhost:4242
  # For Android emulator: use 10.0.2.2:4242
  # For real device: use your computer's IP address
  #
  # To find your IP:
  # - Windows: ipconfig
  # - Mac/Linux: ifconfig
  #
  # Example IPs: 192.168.1.100, 10.15.1.26, etc.

  NEXT_PUBLIC_SERVER_MOBILE=http://10.0.2.2:4242

  # For real device, uncomment and update with your IP:
  # NEXT_PUBLIC_SERVER_MOBILE=http://192.168.1.100:4242

  # ----------------------------------------------
  # Firebase Configuration
  # ----------------------------------------------
  # Get these from Firebase Console:
  # 1. Go to https://console.firebase.google.com/
  # 2. Select your project (or create new)
  # 3. Click gear icon → Project settings
  # 4. Scroll to "Your apps" → Web app
  # 5. Copy configuration values

  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

  # ----------------------------------------------
  # Optional: Google Maps (if you decide to use it)
  # ----------------------------------------------
  # Currently the app uses Leaflet (OpenStreetMap)
  # If you need Google Maps in the future:
  # NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
  ```

- [ ] 5.1.2. Добавить комментарии на русском (опционально):
  ```env
  # Можно также добавить русские комментарии для команды
  # Для Android эмулятора: 10.0.2.2:4242
  # Для реального устройства: IP вашего компьютера
  ```

**Ожидаемый результат:** `.env.example` создан

---

### 5.2. Обновить README с инструкциями

**Шаги:**

- [ ] 5.2.1. Создать `pickom-client/README.md` (если нет)
  ```markdown
  # Pickom Client

  Mobile-first web application for people-powered delivery service.

  ## Tech Stack

  - **Framework:** Next.js 15 with App Router
  - **UI:** Material-UI (MUI) v7
  - **Mobile:** Capacitor for Android/iOS
  - **Maps:** Leaflet (OpenStreetMap)
  - **Auth:** Firebase Authentication
  - **State:** Zustand
  - **Language:** TypeScript

  ## Getting Started

  ### Prerequisites

  - Node.js 18+ and npm
  - (For mobile) Android Studio or Xcode

  ### Installation

  1. Clone the repository
  2. Install dependencies:
     ```bash
     cd pickom-client
     npm install
     ```

  3. Copy environment variables:
     ```bash
     cp .env.example .env
     ```

  4. Update `.env` with your Firebase credentials and server URL

  ### Environment Variables

  See `.env.example` for all required variables.

  **Firebase Setup:**
  1. Go to [Firebase Console](https://console.firebase.google.com/)
  2. Create a new project or select existing
  3. Enable Authentication (Email/Password)
  4. Enable Firestore Database
  5. Copy configuration to `.env`

  **Server URL:**
  - For browser: `http://localhost:4242`
  - For Android emulator: `http://10.0.2.2:4242`
  - For real device: `http://[YOUR_IP]:4242`

  ## Development

  ### Web Development

  ```bash
  npm run dev
  ```

  Open [http://localhost:3000](http://localhost:3000)

  ### Mobile Development (Android)

  **With Live Reload (Emulator):**
  ```bash
  npm run android:dev
  ```

  **With Live Reload (Real Device):**
  1. Get your IP: `ipconfig` (Windows) or `ifconfig` (Mac)
  2. Update `capacitor.config.dev.ts` with your IP
  3. Run: `npm run android:dev`

  ## Production Build

  ### Web Build

  ```bash
  npm run build
  npm run start
  ```

  ### Mobile Build (Android APK)

  ```bash
  npm run android:prod
  ```

  Then build APK in Android Studio: Build → Generate Signed Bundle / APK

  See [CAPACITOR_BUILD.md](./CAPACITOR_BUILD.md) for detailed instructions.

  ## Scripts

  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run lint` - Run ESLint
  - `npm run android:dev` - Run on Android with live reload
  - `npm run android:prod` - Build for Android production

  ## Project Structure

  ```
  app/                 # Next.js App Router pages
  components/          # Reusable components
  lib/                 # Utilities and helpers
  public/              # Static assets
  android/             # Capacitor Android project
  ```

  ## Contributing

  1. Create feature branch
  2. Make changes
  3. Run linter: `npm run lint`
  4. Build project: `npm run build`
  5. Submit pull request

  ## License

  Proprietary - Pickom MVP
  ```

- [ ] 5.2.2. Добавить секцию про environment в существующий README (если есть)

**Ожидаемый результат:** README обновлен

---

### 5.3. Создать Firebase Security Rules (базовые)

**Шаги:**

- [ ] 5.3.1. Создать `firestore.rules` в корне проекта
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {

      // Helper functions
      function isAuthenticated() {
        return request.auth != null;
      }

      function isOwner(userId) {
        return isAuthenticated() && request.auth.uid == userId;
      }

      // Users collection
      match /users/{userId} {
        // Anyone can read user profiles (for public profiles)
        allow read: if true;

        // Only owner can create/update their profile
        allow create, update: if isOwner(userId);

        // No one can delete
        allow delete: if false;
      }

      // Delivery requests collection
      match /deliveryRequests/{requestId} {
        // Anyone authenticated can read
        allow read: if isAuthenticated();

        // Only authenticated users can create
        allow create: if isAuthenticated()
          && request.resource.data.senderId == request.auth.uid;

        // Only sender can update
        allow update: if isAuthenticated()
          && resource.data.senderId == request.auth.uid;

        // Only sender can delete
        allow delete: if isAuthenticated()
          && resource.data.senderId == request.auth.uid;
      }

      // Offers collection
      match /offers/{offerId} {
        // Anyone authenticated can read
        allow read: if isAuthenticated();

        // Only picker can create their offer
        allow create: if isAuthenticated()
          && request.resource.data.pickerId == request.auth.uid;

        // Only picker can update their offer
        allow update: if isAuthenticated()
          && resource.data.pickerId == request.auth.uid;

        // Only picker can delete their offer
        allow delete: if isAuthenticated()
          && resource.data.pickerId == request.auth.uid;
      }

      // Chats collection
      match /chats/{chatId} {
        // Only participants can read
        allow read: if isAuthenticated()
          && request.auth.uid in resource.data.participants;

        // Only participants can create messages
        allow create: if isAuthenticated()
          && request.auth.uid in request.resource.data.participants;

        // Only participants can update
        allow update: if isAuthenticated()
          && request.auth.uid in resource.data.participants;

        // No one can delete chats
        allow delete: if false;
      }

      // Notifications collection
      match /notifications/{notificationId} {
        // Only owner can read their notifications
        allow read: if isAuthenticated()
          && resource.data.userId == request.auth.uid;

        // System can create notifications
        allow create: if isAuthenticated();

        // Only owner can update (mark as read)
        allow update: if isAuthenticated()
          && resource.data.userId == request.auth.uid;

        // Only owner can delete
        allow delete: if isAuthenticated()
          && resource.data.userId == request.auth.uid;
      }

      // Deny all other documents
      match /{document=**} {
        allow read, write: if false;
      }
    }
  }
  ```

- [ ] 5.3.2. Создать `storage.rules` в корне проекта
  ```javascript
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {

      // User avatars
      match /avatars/{userId}/{fileName} {
        // Anyone can read avatars
        allow read: if true;

        // Only owner can upload/update their avatar
        allow write: if request.auth != null
          && request.auth.uid == userId
          && request.resource.size < 5 * 1024 * 1024  // 5MB limit
          && request.resource.contentType.matches('image/.*');
      }

      // Delivery images
      match /deliveries/{deliveryId}/{fileName} {
        // Anyone authenticated can read
        allow read: if request.auth != null;

        // Authenticated users can upload delivery images
        allow write: if request.auth != null
          && request.resource.size < 10 * 1024 * 1024  // 10MB limit
          && request.resource.contentType.matches('image/.*');
      }

      // Deny all other files
      match /{allPaths=**} {
        allow read, write: if false;
      }
    }
  }
  ```

- [ ] 5.3.3. Добавить README для rules
  ```markdown
  # Firebase Security Rules

  ## Deploying Rules

  ### Install Firebase CLI
  ```bash
  npm install -g firebase-tools
  ```

  ### Login
  ```bash
  firebase login
  ```

  ### Deploy Firestore Rules
  ```bash
  firebase deploy --only firestore:rules
  ```

  ### Deploy Storage Rules
  ```bash
  firebase deploy --only storage:rules
  ```

  ### Deploy Both
  ```bash
  firebase deploy --only firestore:rules,storage:rules
  ```

  ## Testing Rules

  Use Firebase Emulator Suite:
  ```bash
  firebase emulators:start
  ```
  ```

  - Сохранить в `FIREBASE_SECURITY.md`

**Ожидаемый результат:** Security rules созданы (но не задеплоены еще)

---

### 5.4. Создать .env для разных окружений

**Шаги:**

- [ ] 5.4.1. Структура env файлов:
  - `.env` - для local development (не коммитится)
  - `.env.example` - template (коммитится)
  - `.env.production` - для production (не коммитится, будет на сервере)

- [ ] 5.4.2. Создать `.env.production.example` (опционально)
  ```env
  # Production Environment Variables
  # Use real production URLs and credentials

  NEXT_PUBLIC_SERVER_MOBILE=https://api.pickom.io

  # Production Firebase project
  NEXT_PUBLIC_FIREBASE_API_KEY=production_api_key
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pickom-prod.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=pickom-prod
  # ... etc
  ```

- [ ] 5.4.3. Обновить .gitignore чтобы точно игнорировал:
  ```
  # Environment files
  .env
  .env.local
  .env.development
  .env.production
  .env*.local
  ```

**Ожидаемый результат:** Env структура настроена

---

### 5.5. Добавить runtime environment validation

**Шаги:**

- [ ] 5.5.1. Создать `pickom-client/lib/env-validation.ts`
  ```typescript
  /**
   * Environment variables validation
   * Ensures all required env vars are present at build/runtime
   */

  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ] as const;

  export function validateEnv() {
    const missing: string[] = [];

    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables:\n${missing.join('\n')}\n\n` +
        'Please copy .env.example to .env and fill in the values.'
      );
    }
  }

  // Validate on import (build time)
  if (typeof window === 'undefined') {
    validateEnv();
  }
  ```

- [ ] 5.5.2. Импортировать validation в `lib/firebase-config.ts`
  ```typescript
  import { validateEnv } from './env-validation';

  // Validate environment variables
  validateEnv();

  // ... rest of firebase config
  ```

**Ожидаемый результат:** Environment variables валидируются при билде

---

### 5.6. Документировать security best practices

**Шаги:**

- [ ] 5.6.1. Создать `SECURITY.md` в корне проекта
  ```markdown
  # Security Guidelines

  ## Environment Variables

  ### DO:
  - ✅ Use `.env.example` as template
  - ✅ Use `NEXT_PUBLIC_` prefix for client-side vars
  - ✅ Keep `.env` out of git (in .gitignore)
  - ✅ Use different Firebase projects for dev/prod
  - ✅ Rotate API keys periodically

  ### DON'T:
  - ❌ Commit `.env` files to git
  - ❌ Share env files in Slack/Email
  - ❌ Use production credentials in development
  - ❌ Hardcode secrets in code

  ## Firebase Security

  ### Client-Side API Keys
  Firebase API keys in `NEXT_PUBLIC_*` are safe to expose because:
  - They identify your Firebase project
  - Security comes from Firebase Security Rules
  - They can't be used to access your backend directly

  ### Security Rules
  - Deploy Firestore rules: `firebase deploy --only firestore:rules`
  - Deploy Storage rules: `firebase deploy --only storage:rules`
  - Test rules with Firebase Emulator

  ### Authentication
  - Always validate `request.auth` in Security Rules
  - Use Firebase Admin SDK in backend for privileged operations
  - Implement proper session management

  ## API Security

  ### Server Communication
  - Use HTTPS in production
  - Validate all user input
  - Implement rate limiting
  - Use CORS properly

  ### Mobile App
  - Use certificate pinning (future)
  - Implement root detection (future)
  - Obfuscate code for release builds

  ## Reporting Security Issues

  If you find a security vulnerability, please email:
  security@pickom.io

  DO NOT create public GitHub issues for security problems.
  ```

**Ожидаемый результат:** Security guidelines документированы

---

## Критерии успеха

### До:
- ❌ Нет .env.example
- ❌ Нет инструкций по setup
- ❌ Нет Firebase Security Rules
- ❌ Нет env validation

### После:
- ✅ .env.example создан
- ✅ README обновлен с инструкциями
- ✅ Firebase Security Rules созданы
- ✅ Environment variables валидируются
- ✅ Security best practices документированы

---

## Файлы для создания/изменения

### Новые файлы:
- `pickom-client/.env.example`
- `pickom-client/README.md` (или обновить существующий)
- `firestore.rules`
- `storage.rules`
- `FIREBASE_SECURITY.md`
- `SECURITY.md`
- `pickom-client/lib/env-validation.ts`

### Изменяемые файлы:
- `pickom-client/lib/firebase-config.ts`
- `.gitignore` (убедиться что .env игнорируется)

---

## Следующий шаг
После завершения этой задачи переходить к: **Task 6: PWA Icons & Assets**

# Production Build Preparation

**Created:** 2025-11-11
**Priority:** High
**Status:** Pending

## Objective
Prepare the Pickom MVP application for production deployment by:
- Configuring production mode for Capacitor
- Removing development logging
- Optimizing API configuration
- Setting up production build process

## Tasks

### 1. Client-side Production Configuration

#### 1.1 Update Capacitor Config for Production
**File:** `pickom-client/capacitor.config.ts`

- [ ] Remove `server.url` configuration (use local files instead of dev server)
- [ ] Keep only production-ready plugins configuration
- [ ] Ensure `webDir: 'out'` points to Next.js build output

**Expected result:**
```typescript
const config: CapacitorConfig = {
  appId: 'pickom.io',
  appName: 'Pickom',
  webDir: 'out',

  android: {
    allowMixedContent: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FF9500',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};
```

#### 1.2 Remove Development Logging
**Files to clean:**
- `pickom-client/app/api/base.ts` - Remove all console.log/console.error in interceptors
- `pickom-client/lib/capacitor-init.ts` - Remove initialization logs
- `pickom-client/components/providers/CapacitorProvider.tsx` - Remove connectivity test logs

**What to remove:**
- ❌ `console.log('🔧 Using mobile API URL:', ...)`
- ❌ `console.log('🔧 Platform:', ...)`
- ❌ `console.log('🎫 Token added to request:', ...)`
- ❌ `console.log('📤 API Request:', ...)`
- ❌ `console.log('✅ API Response:', ...)`
- ❌ `console.error('❌ API Error:', ...)`
- ❌ `console.log('Initializing Capacitor plugins...')`
- ❌ `console.log('✅ StatusBar initialized')`
- ❌ All other development logging

**Keep only:**
- ✅ Critical error logging (for production error tracking)
- ✅ Consider using proper error tracking service (Sentry, etc.)

#### 1.3 Configure Production API URL
**File:** `pickom-client/app/api/base.ts`

- [ ] Add production API URL environment variable
- [ ] Update getApiUrl() function to use production URL for native platform

**Expected configuration:**
```typescript
function getApiUrl(): string {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // Production API URL
    return process.env.NEXT_PUBLIC_API_PROD || 'https://api.pickom.io';
  }

  // Browser
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.pickom.io';
}
```

**Environment variables needed:**
- `.env.production` file with:
  - `NEXT_PUBLIC_API_PROD=https://api.pickom.io`
  - `NEXT_PUBLIC_API_URL=https://api.pickom.io`

### 2. Server-side Production Configuration

#### 2.1 Remove Development Logging
**File:** `pickom-server/src/auth/guards/firebase-auth.guard.ts`

- [ ] Remove `console.error('Session cookie verification failed:', error)`
- [ ] Remove `console.error('Bearer token verification failed:', error)`
- [ ] Use proper logging service (Winston, NestJS Logger)

**File:** `pickom-server/src/auth/auth.controller.ts`

- [ ] Remove `console.log('🔥 Login request received')`
- [ ] Remove `console.log('🔥 Register request received')`
- [ ] Use NestJS Logger instead

#### 2.2 Configure CORS for Production
**File:** `pickom-server/src/main.ts`

- [ ] Update CORS to allow production domain
- [ ] Remove development origins if any

### 3. Network Security Configuration

#### 3.1 Update Android Network Config for Production
**File:** `pickom-client/android/app/src/main/res/xml/network_security_config.xml`

- [ ] Remove development domains (localhost, 10.0.2.2, 192.168.x.x)
- [ ] Keep only production API domain
- [ ] Set `cleartextTrafficPermitted="false"` for production (use HTTPS only)

**Production config:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Production API domain (HTTPS only) -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.pickom.io</domain>
    </domain-config>

    <!-- Default: HTTPS only -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### 4. Build Process

#### 4.1 Create Production Build Script
**File:** `pickom-client/package.json`

Add production build script:
```json
{
  "scripts": {
    "build:prod": "next build && npx cap sync android",
    "android:prod": "npm run build:prod && npx cap open android"
  }
}
```

#### 4.2 Production Build Steps

1. **Build Next.js:**
   ```bash
   cd pickom-client
   npm run build
   ```

2. **Sync Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Generate Signed APK/AAB:**
   - Open Android Studio
   - Build > Generate Signed Bundle / APK
   - Select release build variant
   - Sign with production keystore

### 5. Testing Checklist

Before production release:
- [ ] Test login/logout flow
- [ ] Test all API endpoints
- [ ] Test offline functionality (UI loads without network)
- [ ] Test on real device (not emulator)
- [ ] Verify no development logs in Logcat
- [ ] Test Firebase Auth with production domain
- [ ] Verify HTTPS connections only
- [ ] Test app startup speed
- [ ] Check APK/AAB size

## Expected Benefits

✅ **Performance:**
- App loads instantly (local files vs HTTP requests)
- Reduced network dependency for UI

✅ **Security:**
- No development endpoints exposed
- HTTPS only
- No sensitive data in logs

✅ **User Experience:**
- Native app feel
- Works offline (UI)
- Faster initial load

✅ **Professional:**
- Clean production logs
- Proper error handling
- Ready for Play Store

## Notes

- Keep a separate `capacitor.config.dev.ts` for development if needed
- Consider using environment-based config switching
- Set up proper error tracking (Sentry/Firebase Crashlytics) before removing all logs
- Test thoroughly before removing development server support

## Estimated Time
~2-3 hours

## Dependencies
- Production API server deployed and accessible
- SSL certificate for API domain
- Production Firebase project configured
- Android keystore for signing

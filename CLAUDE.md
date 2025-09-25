# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pickom is a people-powered delivery MVP consisting of two applications:
- **pickom-client**: Next.js 15 mobile-first web app with Capacitor for mobile deployment
- **pickom-server**: NestJS API server with Firebase Authentication

This is a monorepo where both client and server are in separate directories under the root.

## Development Commands

### Client (pickom-client/)
```bash
cd pickom-client
npm install
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production build
npm run lint         # ESLint check
```

### Server (pickom-server/)
```bash
cd pickom-server
npm install
npm run start:dev    # Start development server with watch mode
npm run start:prod   # Start production server
npm run build        # Build TypeScript
npm run lint         # ESLint check and fix
npm run format       # Prettier formatting
npm run test         # Run Jest unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Run tests with coverage
```

## Architecture

### Client Architecture
- **Framework**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4, mobile-first responsive design
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack React Query (v5) with Axios
- **Authentication**: Firebase client SDK
- **Mobile**: Capacitor for Android deployment, PWA optimized
- **Maps Integration**: Google Maps JavaScript API with Places API

**Key Directories:**
- `app/` - Next.js App Router pages and components
- `app/components/` - Reusable UI components
- `app/[page-name]/` - Individual page routes (send-package, select-traveler, etc.)
- `android/` - Capacitor Android build output

### Server Architecture
- **Framework**: NestJS with TypeScript
- **Authentication**: Firebase Admin SDK for session management
- **API Documentation**: Swagger/OpenAPI at `/api` endpoint
- **Testing**: Jest for unit and e2e tests

**Key Directories:**
- `src/` - Main application source
- `src/auth/` - Authentication module with Firebase integration
- `src/delivery/`, `src/offer/`, `src/user/` - Feature modules
- `src/mocks/` - Mock data for development

## Important Configuration

### Environment Variables
**Client (.env.local):**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NODE_ENV=development
```

**Server (.env):**
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
CLIENT_URI=http://localhost:3000
```

### Google Maps Setup
- Requires Maps JavaScript API, Places API, and Geocoding API enabled
- API key restrictions should include localhost domains
- See `pickom-client/GOOGLE_MAPS_SETUP.md` for detailed setup

## Mobile Development

The client is optimized for mobile-first development:
- Touch-friendly interactions (minimum 44px touch targets)
- Safe area support for iOS devices with notches
- Bottom navigation pattern
- PWA capabilities with Capacitor integration

**Testing on Mobile:**
```bash
cd pickom-client
npm run dev
# Access via http://[your-ip]:3000 on mobile device
```

## API Integration

- Server runs on port 3000 with Swagger docs at `/api`
- Authentication uses Firebase ID tokens with session cookies
- CORS configured for client domain
- All endpoints require authentication except `/auth/login`

## Code Conventions

### Client
- Mobile-first Tailwind CSS classes
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Component-based architecture with reusable UI components

### Server
- NestJS module-based architecture
- DTOs for request/response validation
- Firebase Admin SDK for secure authentication
- Swagger decorators for API documentation

## Key Features Implementation

1. **Package Delivery Flow**: send-package → package-details → select-traveler → confirm-payment
2. **Google Maps Integration**: Location selection with autocomplete and map modal
3. **Firebase Authentication**: Secure session management with cookies
4. **Mobile Optimization**: Touch-friendly UI with bottom navigation
5. **Real-time Tracking**: Planned feature with location tracking capabilities

## Testing

Always run lint and build commands before committing:
```bash
# Client
cd pickom-client && npm run lint && npm run build

# Server
cd pickom-server && npm run lint && npm run test && npm run build
```
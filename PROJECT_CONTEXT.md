# Pickom Project Context

## Project Overview

**Pickom** - MVP платформа для people-powered доставки. Пользователи могут отправлять посылки (sender role) или доставлять их (picker role).

**Tech Stack**:
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Material-UI, Capacitor (mobile)
- **Backend**: NestJS, TypeORM, PostgreSQL, Firebase Auth, Socket.IO (WebSocket)
- **Maps**: Google Maps JavaScript API, Leaflet (OpenStreetMap)
- **Real-time**: Socket.IO для tracking

## Project Structure

```
pickom/
├── pickom-client/          # Next.js frontend (mobile-first)
│   ├── app/
│   │   ├── api/            # API client functions
│   │   ├── hooks/          # React hooks (включая WebSocket)
│   │   ├── components/     # Reusable UI components
│   │   ├── tracking/       # Real-time tracking pages
│   │   ├── active-delivery/# Picker's active delivery
│   │   └── ...             # Other pages
│   ├── android/            # Capacitor Android build
│   └── lib/                # Firebase config, utilities
│
├── pickom-server/          # NestJS backend
│   ├── src/
│   │   ├── auth/           # Firebase authentication
│   │   ├── delivery/       # Delivery management
│   │   ├── offer/          # Offer system (picker bids)
│   │   ├── traking/        # Real-time tracking (WebSocket)
│   │   ├── chat/           # Chat between users
│   │   ├── notification/   # Push notifications
│   │   └── user/           # User management
│   └── test/
│
├── CLAUDE.md              # Instructions for Claude Code
└── *.md                   # Documentation files
```

## Key Concepts

### User Roles

1. **Sender** - отправляет посылки
2. **Picker** - доставляет посылки
3. **Receiver** - получает посылки (может быть другим пользователем или телефон)

### Delivery Flow

```
1. Sender creates delivery request
   └─> Status: 'pending'

2. Picker sees available deliveries
   └─> Can make offer with custom price

3. Sender accepts offer
   └─> Status: 'accepted'
   └─> Tracking record created
   └─> Chat rooms created (sender↔picker, picker↔receiver)

4. Picker marks "Picked Up"
   └─> Status: 'picked_up'
   └─> Location tracking starts (WebSocket)

5. Picker delivers to receiver
   └─> Status: 'delivered'
   └─> Location tracking stops
   └─> Picker gets paid
```

### Database Schema (Key Tables)

#### users
```sql
id SERIAL PRIMARY KEY
firebase_uid TEXT UNIQUE
email TEXT
name TEXT
role ENUM('sender', 'picker')
location JSONB { lat, lng, address?, city?, placeId? }
is_online BOOLEAN
balance DECIMAL
rating DECIMAL
completed_deliveries INT
```

#### deliveries
```sql
id SERIAL PRIMARY KEY
sender_id INT → users(id)
picker_id INT → users(id) [nullable]
recipient_id INT → users(id) [nullable]
recipient_phone TEXT [nullable]
from_location JSONB { lat, lng, address, city?, placeId? }
to_location JSONB { lat, lng, address, city?, placeId? }
status ENUM('pending', 'accepted', 'picked_up', 'delivered', 'cancelled')
price DECIMAL
size ENUM('small', 'medium', 'large')
```

#### tracking (NEW)
```sql
id SERIAL PRIMARY KEY
delivery_id INT → deliveries(id) ON DELETE CASCADE
picker_id INT → users(id)
sender_id INT → users(id)
receiver_id INT → users(id) [nullable]
from_location JSONB
to_location JSONB
picker_location JSONB { lat, lng, timestamp } [nullable, updates in real-time]
status ENUM(...)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### offers
```sql
id SERIAL PRIMARY KEY
delivery_id INT → deliveries(id)
picker_id INT → users(id)
price DECIMAL
status ENUM('pending', 'accepted', 'rejected')
```

## Authentication Flow

**Firebase Authentication** (session cookies):

```
1. User logs in with Firebase (client)
   └─> Gets Firebase ID token

2. Client sends token to /auth/login or /auth/register
   └─> Server verifies token with Firebase Admin SDK
   └─> Creates session cookie (httpOnly)
   └─> Returns user data

3. Protected routes use FirebaseAuthGuard
   └─> Verifies session cookie
   └─> Decodes Firebase token
   └─> Adds user to request object

4. WebSocket uses WsAuthGuard
   └─> Reads token from handshake.headers.authorization
   └─> Verifies with Firebase Admin SDK
```

## Real-Time Tracking (WebSocket)

### Architecture

**Socket.IO namespace**: `/tracking`

**Rooms**: `delivery-{deliveryId}`

### Events Flow

```
Picker (moving):
  navigator.geolocation.watchPosition()
  └─> usePickerLocationTracking hook
      └─> Calculates distance from last position
      └─> If >10m: send every 1s (moving)
      └─> If ≤10m: send every 5s (stationary)
      └─> Emits: 'update-location'

Server (TrackingGateway):
  Receives 'update-location'
  └─> Validates picker access
  └─> Updates tracking.pickerLocation in DB
  └─> Broadcasts 'location-updated' to room

Sender/Receiver:
  useWebSocketTracking hook
  └─> Listens to 'location-updated'
  └─> Updates map in real-time
  └─> Recalculates route via OSRM API
```

### Key Files

**Backend**:
- `src/traking/traking.gateway.ts` - WebSocket gateway
- `src/traking/traking.service.ts` - Tracking business logic
- `src/traking/entities/traking.entity.ts` - Database entity

**Frontend**:
- `app/hooks/useWebSocketTracking.ts` - WebSocket hooks
- `app/tracking/[deliveryId]/page.tsx` - Tracking page (sender/receiver)
- `app/active-delivery/[id]/page.tsx` - Active delivery (picker)

## API Endpoints Overview

### Authentication
```
POST   /auth/login        - Login with Firebase token
POST   /auth/register     - Register new user
GET    /auth/me           - Get current user
POST   /auth/logout       - Logout (clear cookie)
```

### Delivery
```
POST   /delivery/requests              - Create delivery
GET    /delivery/requests              - Get user's deliveries
GET    /delivery/requests/:id          - Get single delivery
PUT    /delivery/requests/:id          - Update delivery
PUT    /delivery/requests/:id/status   - Update delivery status
POST   /delivery/requests/:id/confirm-receiver - Receiver confirmation
```

### Offers
```
POST   /offers                         - Create offer (picker)
GET    /offers/delivery/:deliveryId    - Get offers for delivery
PUT    /offers/:id/accept              - Accept offer (sender)
PUT    /offers/:id/reject              - Reject offer
```

### Tracking (NEW)
```
GET    /traking/:deliveryId            - Get tracking data
PUT    /traking/:deliveryId/location   - Update picker location
PUT    /traking/:deliveryId/status     - Update tracking status
```

### Chat
```
POST   /chat                           - Create chat
GET    /chat                           - Get user's chats
POST   /chat/:id/messages              - Send message
GET    /chat/:id/messages              - Get messages
```

### User
```
GET    /user/:uid                      - Get user by UID
PUT    /user/:uid/location             - Update user location
PUT    /user/:uid/online-status        - Update online status
```

## Environment Variables

### Client (.env.local)
```bash
NEXT_PUBLIC_SERVER=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Server (.env)
```bash
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=pickom

# Other
CLIENT_URI=http://localhost:3000
PORT=3000
```

## Development Workflow

### Starting the project

```bash
# Terminal 1 - Backend
cd pickom-server
npm run start:dev

# Terminal 2 - Frontend
cd pickom-client
npm run dev
```

### Testing changes

```bash
# Backend
cd pickom-server
npm run build          # Check TypeScript errors
npm run lint           # ESLint
npm run test           # Jest tests

# Frontend
cd pickom-client
npm run build          # Check TypeScript errors
npm run lint           # ESLint
```

### Git workflow

```bash
# Current branch
git branch  # Should show: frontend-backend-integration-tracking

# Making changes
git add .
git commit -m "feat: short description"

# When ready
git push origin frontend-backend-integration-tracking
```

## Common Tasks

### Adding a new API endpoint

1. Create DTO in `src/{module}/dto/`
2. Add method to service `src/{module}/{module}.service.ts`
3. Add controller endpoint `src/{module}/{module}.controller.ts`
4. Add client function `pickom-client/app/api/{module}.ts`

### Adding a new page

1. Create `pickom-client/app/{route}/page.tsx`
2. Add navigation link in `BottomNavigation` or other nav component
3. Add API calls using hooks or direct API functions

### Updating database schema

1. Modify entity in `src/{module}/entities/{entity}.entity.ts`
2. Create migration: `npm run typeorm migration:generate -- -n MigrationName`
3. Run migration: `npm run typeorm migration:run`

## Important Notes

### Mobile-First Design
- Always use responsive Tailwind classes
- Touch targets должны быть ≥44px
- Test on mobile viewport (375px width)

### Firebase Auth
- All protected routes need authentication
- ID tokens expire - handle refresh
- Use httpOnly cookies for security

### WebSocket
- Always handle connection/disconnection
- Implement reconnection logic
- Clean up subscriptions in useEffect cleanup

### TypeScript
- Avoid `any` type - use proper interfaces
- Enable strict mode
- Use Zod for runtime validation where needed

### Commit Messages
- Format: `<type>: <description>`
- Types: feat, fix, refactor, docs, test, chore
- Max 50-60 characters
- Examples:
  - `feat: add real-time tracking`
  - `fix: websocket reconnection`
  - `refactor: simplify auth flow`

## Debugging Tips

### Backend Issues
```bash
# View logs
cd pickom-server
npm run start:dev  # Watch mode with logs

# Check database
psql -U postgres -d pickom
SELECT * FROM users LIMIT 5;
```

### Frontend Issues
```bash
# Check browser console for errors
# Use React DevTools
# Check Network tab for API calls

# Clear Next.js cache
rm -rf .next
npm run dev
```

### WebSocket Issues
```bash
# Server logs show WebSocket events
# Client logs show socket.on/emit

# Check connection:
console.log('Socket connected:', socket.connected);
```

## Recent Changes (2025-11-10)

✅ Implemented real-time tracking with WebSocket
✅ Created tracking table in database
✅ Added smart location updates (1s moving, 5s stationary)
✅ Integrated WebSocket in tracking pages
✅ Added access control (sender/picker/receiver only)
✅ Tracking records preserved for history

See `REALTIME_TRACKING_IMPLEMENTATION.md` for details.

## TODO / Known Issues

- [ ] Implement WebSocket reconnection logic
- [ ] Add offline queue for location updates
- [ ] Optimize battery usage on mobile
- [ ] Create database migrations
- [ ] Add comprehensive tests for tracking
- [ ] Add error boundaries in React
- [ ] Implement proper loading states
- [ ] Add analytics for tracking

## Useful Commands

```bash
# Backend
npm run start:dev       # Start with watch mode
npm run build           # Build for production
npm run lint            # ESLint check
npm run test            # Run tests
npm run typeorm         # TypeORM CLI

# Frontend
npm run dev             # Start dev server
npm run build           # Production build
npm run lint            # ESLint check
npm run start           # Start production build

# Both
npm install             # Install dependencies
npm audit fix           # Fix vulnerabilities
```

## Links & Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [TypeORM Docs](https://typeorm.io/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Material-UI Docs](https://mui.com/)
- [Leaflet Docs](https://leafletjs.com/)

---

**Last Updated**: 2025-11-10
**Version**: 1.0
**Branch**: `frontend-backend-integration-tracking`

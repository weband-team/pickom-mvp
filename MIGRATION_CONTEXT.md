# 🔄 Migration Context: Mock Data to PostgreSQL

## 📋 Executive Summary

This document provides a comprehensive context for migrating all mock data in the Pickom project to PostgreSQL database. The project currently uses mock data in 3 critical production paths that must be replaced with real database operations.

**Project**: Pickom - People-powered delivery MVP
**Tech Stack**: NestJS (Backend) + Next.js (Frontend) + PostgreSQL + TypeORM
**Migration Priority**: HIGH (Production blocking)
**Estimated Effort**: 3-5 days

---

## 🎯 Migration Goals

1. **Replace all mock data usage** with PostgreSQL queries
2. **Maintain backward compatibility** during migration
3. **Add missing database entities** where needed
4. **Update client-side code** to use real API endpoints
5. **Remove obsolete mock files** after successful migration

---

## 📊 Current State Analysis

### Server-Side Mock Usage (NestJS)

#### ✅ Already using PostgreSQL:
- ✅ `User` entity - fully integrated with PostgreSQL
- ✅ `Delivery` entity - fully integrated with PostgreSQL
- ✅ `Offer` entity - fully integrated with PostgreSQL
- ✅ `Notification` entity - fully integrated with PostgreSQL
- ✅ `Payment` entity - exists in DB
- ✅ `Rating` entity - exists in DB
- ✅ `ChatSession` and `Message` entities - exist in DB

#### ❌ Still using mock data:

1. **Tracking Service** (`src/traking/traking.service.ts`)
   - **File**: `src/mocks/traking.mock.ts`
   - **Current**: Uses in-memory array `MOCK_TRAKINGS`
   - **Issue**: Interface only, no TypeORM entity
   - **Impact**: Tracking data lost on server restart
   - **Lines**: 13, 18, 26-34

### Client-Side Mock Usage (Next.js)

#### ❌ Critical production paths using mocks:

1. **Order Details Page** (`app/orders/[id]/page.tsx`)
   - **Mock file**: `data/mockOrders.ts`
   - **Line**: 27 - `mockOrders.find(o => o.id === orderId)`
   - **Impact**: Shows fake order data instead of real orders
   - **Required API**: `GET /api/deliveries/:id` (already exists)
   - **Status**: 🔴 CRITICAL - Production blocker

2. **Browse Senders Page** (`app/browse-senders/page.tsx`)
   - **Mock file**: `data/mockSenders.ts`
   - **Line**: 64 - `mockSenders[senderId]`
   - **Impact**: Shows fake sender profiles (name, avatar, rating)
   - **Required API**: `GET /api/users/:uid` or extend delivery response
   - **Status**: 🔴 CRITICAL - Hybrid (real deliveries + mock users)

3. **Available Deliveries Settings** (`app/available-deliveries/page.tsx`)
   - **Mock file**: `data/mockPickerSettings.ts`
   - **Lines**: 76-96 - Mock picker profile data
   - **Impact**: Temporary placeholder, should use real user profile
   - **Required**: Use existing user profile data
   - **Status**: 🟡 MEDIUM - Workaround exists (localStorage)

#### ✅ Already using real data:

- ✅ **Picker Results** (`app/picker-results/page.tsx`) - Uses `getAvailablePickers()` API
- ✅ **Delivery Methods** - Uses `createDeliveryRequest()` and `updateDeliveryRequest()` APIs
- ✅ **Profile Pages** - Uses `handleMe()` and `updateUser()` APIs

#### ⚪ Helper functions (safe to keep):

- ⚪ `filterPickers()` from `mockPickers.ts` - Pure filtering logic, works with real data
- ⚪ `mockPickerSettings.ts` - localStorage helpers (not actual mock data)

---

## 🗄️ Database Schema Current State

### Existing Entities (TypeORM)

```typescript
// src/user/entities/user.entity.ts
@Entity('users')
class User {
  id: number (PK)
  uid: string (unique, firebase_uid)
  email: string (unique)
  name: string
  phone: string
  role: 'sender' | 'picker'
  avatarUrl: string
  rating: decimal(3,2)
  totalRatings: int
  balance: decimal(10,2)
  active: boolean
  isOnline: boolean
  basePrice: decimal(10,2)
  completedDeliveries: int
  totalOrders: int
  createdAt: timestamp
  updatedAt: timestamp
  prevLoginAt: timestamp
  about: text
  location: jsonb { lat, lng, placeId?, address? }

  // Relations
  sentDeliveries: Delivery[]
  pickedDeliveries: Delivery[]
  offers: Offer[]
  notifications: Notification[]
}

// src/delivery/entities/delivery.entity.ts
@Entity('deliveries')
class Delivery {
  id: number (PK)
  senderId: number (FK -> users.id)
  pickerId: number (FK -> users.id, nullable)
  recipientId: number (FK -> users.id, nullable)
  title: string
  description: text
  fromLocation: jsonb { lat, lng, address, city?, placeId? }
  toLocation: jsonb { lat, lng, address, city?, placeId? }
  deliveryType: 'within-city' | 'inter-city'
  price: decimal(10,2)
  size: 'small' | 'medium' | 'large'
  weight: decimal(10,2)
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled'
  deliveryDate: date
  notes: text
  deliveriesUrl: text
  createdAt: timestamp
  updatedAt: timestamp

  // Relations
  sender: User
  picker: User
  recipient: User
  offers: Offer[]
  payments: Payment[]
  ratings: Rating[]
}

// src/offer/entities/offer.entity.ts
@Entity('offers')
class Offer {
  id: number (PK)
  deliveryId: number (FK -> deliveries.id)
  pickerId: number (FK -> users.id)
  price: decimal(10,2)
  message: text
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: timestamp

  // Relations
  delivery: Delivery
  picker: User
}

// src/notification/entities/notification.entity.ts
@Entity('notifications')
class Notification {
  id: number (PK)
  userId: number (FK -> users.id)
  title: string
  message: text
  type: 'new_delivery' | 'offer_received' | 'status_update' | 'offer_accepted' | 'incoming_delivery' | 'new_message'
  read: boolean
  relatedDeliveryId: number (nullable)
  createdAt: timestamp

  // Relations
  user: User
}
```

### ❌ Missing Entity (needs creation):

```typescript
// src/tracking/entities/tracking.entity.ts - DOES NOT EXIST AS TYPEORM ENTITY
// Currently only an interface in src/traking/entities/traking.entity.ts

// NEEDED:
@Entity('delivery_tracking')
class DeliveryTracking {
  id: number (PK)
  deliveryId: number (FK -> deliveries.id)
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled'
  location: jsonb { lat, lng } (optional - for real-time GPS)
  notes: text (optional)
  createdAt: timestamp

  // Relations
  delivery: Delivery
}
```

---

## 🔧 Migration Tasks

### Phase 1: Server-Side (Backend)

#### Task 1.1: Create Tracking Entity ⚠️ HIGH PRIORITY
**File**: `src/tracking/entities/tracking.entity.ts` (rename from traking)

**Action**:
1. Create proper TypeORM entity for `DeliveryTracking`
2. Add migration file for new table
3. Fix typo: `traking` → `tracking` in all files
4. Add OneToMany relation in `Delivery` entity

**Files to modify**:
- Create: `src/tracking/entities/tracking.entity.ts`
- Rename: `src/traking/` → `src/tracking/`
- Update: `src/delivery/entities/delivery.entity.ts` (add tracking relation)

**Migration SQL**:
```sql
CREATE TABLE delivery_tracking (
  id SERIAL PRIMARY KEY,
  delivery_id INTEGER NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'picked_up', 'delivered', 'cancelled')),
  location JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tracking_delivery ON delivery_tracking(delivery_id);
CREATE INDEX idx_tracking_created ON delivery_tracking(created_at DESC);
```

#### Task 1.2: Update Tracking Service ⚠️ HIGH PRIORITY
**File**: `src/tracking/tracking.service.ts`

**Action**:
1. Remove mock data imports
2. Inject TypeORM repository
3. Replace in-memory operations with DB queries
4. Add proper error handling

**Before**:
```typescript
private traking = MOCK_TRAKINGS;

async getTraking(id: number): Promise<Traking | null> {
  const traking = this.traking.find((traking) => traking.id === id);
  return traking || null;
}
```

**After**:
```typescript
constructor(
  @InjectRepository(DeliveryTracking)
  private trackingRepository: Repository<DeliveryTracking>,
) {}

async getTracking(id: number): Promise<DeliveryTracking | null> {
  return await this.trackingRepository.findOne({ where: { id } });
}

async getTrackingByDelivery(deliveryId: number): Promise<DeliveryTracking[]> {
  return await this.trackingRepository.find({
    where: { deliveryId },
    order: { createdAt: 'DESC' }
  });
}
```

### Phase 2: Client-Side (Frontend)

#### Task 2.1: Fix Order Details Page 🔴 CRITICAL
**File**: `app/orders/[id]/page.tsx`

**Current Problem**:
```typescript
// Line 27 - Uses mock data
const initialOrder = mockOrders.find(o => o.id === orderId);
```

**Solution**:
Create API call to fetch real order from backend

**Required API endpoint** (check if exists):
- `GET /api/deliveries/:id` - Should return delivery with populated relations

**New implementation**:
```typescript
// Remove line 10: import { mockOrders } from '@/data/mockOrders';

// Add API call
import { getDeliveryById } from '@/app/api/delivery';

// In component:
const [order, setOrder] = useState<Order | undefined>(undefined);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchOrder = async () => {
    try {
      const response = await getDeliveryById(parseInt(orderId));
      setOrder(mapDeliveryToOrder(response.data)); // Map backend format to Order type
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchOrder();
}, [orderId]);
```

**Backend changes needed**:
- Ensure `GET /deliveries/:id` includes:
  - Sender user data (name, avatar, rating)
  - Picker user data (name, avatar, rating, phone)
  - Delivery tracking history
  - Reviews/ratings if completed

#### Task 2.2: Fix Browse Senders Page 🔴 CRITICAL
**File**: `app/browse-senders/page.tsx`

**Current Problem**:
```typescript
// Line 64 - Uses mock sender data
const sender = mockSenders[senderId];
```

**Solution Option 1** (Preferred): Populate sender in delivery response
```typescript
// Backend: Update getMyDeliveryRequests to include sender relation
@Get()
async getMyDeliveryRequests(@Req() req) {
  return this.deliveryService.findBySender(req.user.uid, {
    relations: ['sender', 'picker'] // Add relations
  });
}
```

**Solution Option 2**: Separate API call for each sender
```typescript
// Frontend: Fetch sender details
const fetchSenderDetails = async (senderId: string) => {
  const response = await getUserById(senderId); // New API endpoint
  return response.data;
};
```

**Recommended**: Option 1 - More efficient (single query with JOIN)

#### Task 2.3: Update Available Deliveries Settings 🟡 MEDIUM
**File**: `app/available-deliveries/page.tsx`

**Current Problem**:
```typescript
// Lines 76-96 - Mock picker data
const mockPickerData = {
  fullName: 'John Smith',
  // ... other mock fields
};
```

**Solution**:
Use real user profile data from `/me` endpoint

```typescript
// Already available from handleMe() API
const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    const response = await handleMe();
    setCurrentUser(response.data.user);
  };
  fetchUser();
}, []);

// Use currentUser instead of mockPickerData
```

### Phase 3: Data Validation & Testing

#### Task 3.1: Verify User Data Completeness
**Check if all required fields exist**:
- ✅ User.name
- ✅ User.avatarUrl
- ✅ User.rating
- ✅ User.totalRatings
- ✅ User.totalOrders
- ❓ User.isPhoneVerified (add if missing)
- ❓ User.isEmailVerified (add if missing)
- ✅ User.completedDeliveries

#### Task 3.2: Add Missing Fields to User Entity
**If needed**:

```typescript
// In user.entity.ts
@Column({ type: 'boolean', default: false, name: 'is_phone_verified' })
isPhoneVerified: boolean;

@Column({ type: 'boolean', default: false, name: 'is_email_verified' })
isEmailVerified: boolean;
```

**Migration**:
```sql
ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT false;
```

### Phase 4: Cleanup

#### Task 4.1: Remove Obsolete Mock Files
**After successful migration**, delete:

Server:
- ❌ `src/mocks/traking.mock.ts`
- ⚪ Keep `src/mocks/users.mock.ts` (for seeding/testing)
- ⚪ Keep `src/mocks/delivery-requests.mock.ts` (for seeding/testing)
- ⚪ Keep `src/mocks/offer.mock.ts` (for seeding/testing)
- ⚪ Keep `src/mocks/notification.mock.ts` (for seeding/testing)

Client:
- ❌ `data/mockOrders.ts` (after Task 2.1)
- ❌ `data/mockSenders.ts` (after Task 2.2)
- ⚪ Keep `data/mockPickers.ts` (filterPickers function still useful)
- ❌ `data/mockChat.ts` (unused)
- ⚪ Keep `data/mockPickerSettings.ts` (localStorage helpers)

#### Task 4.2: Update Imports
Remove all imports of deleted mock files:
- `app/orders/[id]/page.tsx`
- `app/browse-senders/page.tsx`
- `src/traking/traking.service.ts`
- `src/traking/traking.controller.ts`

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Create tracking entity successfully
- [ ] Tracking service creates records in DB
- [ ] Tracking service retrieves records from DB
- [ ] Delivery endpoint includes sender/picker relations
- [ ] User profile endpoint returns all required fields

### Frontend Tests
- [ ] Order details page loads real order data
- [ ] Order details page shows correct sender/picker info
- [ ] Browse senders page shows real sender profiles
- [ ] Browse senders page shows correct ratings/avatars
- [ ] Available deliveries uses real user profile
- [ ] No console errors about missing data
- [ ] All UI elements display correctly with real data

### Integration Tests
- [ ] Create delivery → tracking record created
- [ ] Update delivery status → tracking record created
- [ ] View order → all data displayed correctly
- [ ] Browse senders → all sender data displayed
- [ ] Profile settings → real data used

### Performance Tests
- [ ] Order details page loads < 500ms
- [ ] Browse senders page loads < 1s with 50+ orders
- [ ] Tracking queries optimized with indexes

---

## 📝 Implementation Order (Recommended)

### Sprint 1 (Days 1-2): Backend Foundation
1. ✅ Create `DeliveryTracking` entity
2. ✅ Run database migration
3. ✅ Update `TrackingService` to use DB
4. ✅ Fix typo: traking → tracking
5. ✅ Test tracking CRUD operations

### Sprint 2 (Day 3): Backend API Enhancement
1. ✅ Update delivery endpoints to include relations
2. ✅ Add user verification fields if missing
3. ✅ Test API responses include all needed data
4. ✅ Update API documentation

### Sprint 3 (Days 4-5): Frontend Migration
1. ✅ Update `orders/[id]/page.tsx` to use API
2. ✅ Update `browse-senders/page.tsx` to use API
3. ✅ Update `available-deliveries/page.tsx` to use profile
4. ✅ Remove mock imports
5. ✅ Integration testing
6. ✅ Delete obsolete mock files

---

## 🚨 Risks & Mitigation

### Risk 1: Missing User Data
**Problem**: Some users might not have avatarUrl, rating, etc.
**Mitigation**:
- Add default values in User entity
- Frontend should handle null/undefined gracefully
- Show placeholder avatar if avatarUrl missing

### Risk 2: Performance Issues
**Problem**: N+1 queries when loading deliveries with users
**Mitigation**:
- Use TypeORM `relations` parameter
- Add database indexes on foreign keys
- Implement pagination

### Risk 3: Data Format Mismatch
**Problem**: Backend format differs from mock format
**Mitigation**:
- Create mapper functions (e.g., `mapDeliveryToOrder`)
- Update TypeScript types to match backend
- Gradual migration with feature flags

### Risk 4: Tracking Table Size
**Problem**: Tracking table grows quickly with many status updates
**Mitigation**:
- Add created_at index for efficient queries
- Implement data retention policy (archive old records)
- Consider partitioning by date

---

## 📦 Required API Endpoints (Verification)

### Existing Endpoints (Verify functionality):
- ✅ `GET /deliveries` - List deliveries
- ✅ `GET /deliveries/:id` - Single delivery (**needs sender/picker relations**)
- ✅ `POST /deliveries` - Create delivery
- ✅ `PATCH /deliveries/:id` - Update delivery
- ✅ `GET /users/me` - Current user profile
- ✅ `PATCH /users/:uid` - Update user

### New Endpoints (If needed):
- ❓ `GET /users/:uid` - Get any user by UID (for sender profiles)
- ❓ `GET /deliveries/:id/tracking` - Get tracking history
- ❓ `POST /deliveries/:id/tracking` - Add tracking update

---

## 🔍 Code Search Commands

### Find all mock imports:
```bash
# Client
grep -r "from.*mock" pickom-client/app --include="*.tsx" --include="*.ts"

# Server
grep -r "MOCK_" pickom-server/src --include="*.ts" | grep -v "mocks/"
```

### Find hardcoded data:
```bash
# Look for large arrays/objects
grep -r "const.*=.*\[" pickom-client/data --include="*.ts"
```

### Verify database entities:
```bash
find pickom-server/src -name "*.entity.ts" -type f
```

---

## 📚 Related Documentation

- TypeORM Relations: https://typeorm.io/relations
- NestJS Database: https://docs.nestjs.com/techniques/database
- Next.js Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
- PostgreSQL JSONB: https://www.postgresql.org/docs/current/datatype-json.html

---

## ✅ Success Criteria

Migration is complete when:
1. ✅ All mock imports removed from production code
2. ✅ Tracking service uses PostgreSQL
3. ✅ Order details page shows real data
4. ✅ Browse senders page shows real sender info
5. ✅ All tests passing
6. ✅ No console errors
7. ✅ Performance benchmarks met
8. ✅ Code review approved
9. ✅ QA testing completed
10. ✅ Documentation updated

---

## 👥 Stakeholders

- **Backend Developer**: Entity creation, service updates, API endpoints
- **Frontend Developer**: Page updates, API integration, UI testing
- **DevOps**: Database migrations, monitoring
- **QA**: Integration testing, regression testing
- **Product Owner**: Feature validation, UAT

---

## 📅 Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Backend (Tracking) | 1-2 days | Database access, TypeORM knowledge |
| Phase 2: Client Updates | 2-3 days | Phase 1 complete |
| Phase 3: Testing | 1 day | Phase 2 complete |
| Phase 4: Cleanup | 0.5 day | Phase 3 complete |
| **Total** | **4.5-6.5 days** | - |

---

## 🎓 Key Learnings

1. **Always use database entities** instead of in-memory data
2. **Include relations** in API responses to avoid N+1 queries
3. **Type safety** - ensure frontend types match backend DTOs
4. **Test with real data** early in development
5. **Gradual migration** - one page at a time
6. **Keep mock files** for seeding test databases

---

## 📞 Support

For questions or issues during migration:
- Backend: Check TypeORM documentation
- Frontend: Review Next.js App Router docs
- Database: PostgreSQL JSONB and indexing
- Testing: Jest for unit tests, Playwright for E2E

---

**Last Updated**: 2025-10-20
**Document Version**: 1.0
**Author**: Migration Team
**Status**: Ready for Implementation

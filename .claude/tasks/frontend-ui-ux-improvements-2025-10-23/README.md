# Frontend UI/UX Improvements Task

**Created**: 2025-10-23
**Priority**: High
**Estimated Time**: 6-8 hours
**Status**: Not Started

---

## Overview

Comprehensive frontend improvements focusing on:
- UI consistency (button styling, modal layouts)
- UX enhancements (navigation, sorting, filtering)
- Localization (Russian → English)
- Theme fixes (dark mode container scope)
- Navigation and routing improvements

---

## Task Breakdown

### 1. Global Button Styling (0.5 hours)
**Priority**: Medium

- [ ] Reduce border-radius on all buttons across the application
- [ ] Update global button styles in Tailwind config or component library
- [ ] Recommended: `rounded-md` (0.375rem) instead of `rounded-lg` or `rounded-xl`

**Files to check**:
- `pickom-client/app/components/ui/Button.tsx` (if exists)
- Global Tailwind classes usage
- Material-UI theme overrides

---

### 2. /available-deliveries Page (1.5 hours)
**Priority**: High
**File**: `pickom-client/app/available-deliveries/page.tsx`

#### 2.1 Tab Alignment
- [ ] Fix tabs (Available, Invitations, Active, History) to start from left edge
- [ ] Remove left padding/margin on tab container
- [ ] Ensure tabs are aligned with mobile container edges

#### 2.2 Plan a Trip - Date Format
- [ ] Change date format from Russian to English in "Departure and Arrival Date & Time" picker
- [ ] Check DatePicker component locale settings
- [ ] Use `en-US` or `en-GB` locale

#### 2.3 Modal Windows - Container Scope
**Modals to fix**:
- My Picker Card Preview
- Edit Picker Card
- View Card
- Make an Offer

**Requirements**:
- [ ] Modal width should match mobile container width (not full screen)
- [ ] Position modals at bottom of screen
- [ ] Modals should overlay/cover Bottom-navigation
- [ ] Add proper slide-up animation
- [ ] Consider using MUI Drawer component with `anchor="bottom"`

**Recommended approach**:
```tsx
<Drawer
  anchor="bottom"
  open={isOpen}
  onClose={handleClose}
  sx={{
    '& .MuiDrawer-paper': {
      maxWidth: '450px',
      margin: '0 auto',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
    }
  }}
>
  {/* Modal content */}
</Drawer>
```

---

### 3. /delivery-details/[id] Page (1 hour)
**Priority**: Medium
**File**: `pickom-client/app/delivery-details/[id]/page.tsx`

#### 3.1 Scroll Issue
- [ ] Remove duplicate scrolling (appears after Receiver Information was added)
- [ ] Keep only one main scroll for entire page
- [ ] Remove overflow properties from nested containers

#### 3.2 Fixed Component Position
- [ ] Move "Chat with Sender" and status change component lower
- [ ] Component takes too much space at top
- [ ] Utilize empty space below buttons
- [ ] Consider making it a sticky footer instead of fixed top

**Suggested layout**:
```
[Delivery Details Content] (scrollable)
[Empty space utilized]
[Chat + Status Component] (sticky bottom, above nav)
[Bottom Navigation] (fixed)
```

---

### 4. /notifications Page (0.5 hours)
**Priority**: Low
**File**: `pickom-client/app/notifications/page.tsx`

#### 4.1 "Mark all as Read" Message
- [ ] Change success message from Russian to English
- [ ] Likely in a Toast/Snackbar component
- [ ] Find and replace: "Все уведомления отмечены как прочитанные" → "All notifications marked as read"

#### 4.2 Dark Theme Scope
- [ ] Dark theme should only affect mobile container, not entire page
- [ ] Currently partially fixed on some pages
- [ ] Apply consistent scoping across all pages
- [ ] Check theme provider wrapper

**Solution**: Wrap only mobile container with theme provider
```tsx
<div className="min-h-screen bg-gray-100"> {/* Light background */}
  <div className="max-w-md mx-auto dark:bg-gray-900"> {/* Dark container */}
    {/* App content */}
  </div>
</div>
```

---

### 5. /delivery-methods Page (2 hours)
**Priority**: High
**File**: `pickom-client/app/delivery-methods/page.tsx`

#### 5.1 My Deliveries Tab Improvements

**Current issues**:
- Poor sorting
- Not visually appealing
- Deliveries not clickable
- Addresses too verbose

**Required changes**:
- [ ] Make deliveries clickable → navigate to `/delivery-details/[id]`
- [ ] Sort by newest first (createdAt DESC)
- [ ] Shorten address display (hide postal code, show only street + city)
- [ ] Add visual status indicators

#### 5.2 Sub-tabs for My Deliveries
**Suggested breakdown**:
```
My Deliveries
├── Active (in_progress, pending_pickup, in_transit)
├── Pending (created, pending_confirmation)
├── Completed (delivered, completed)
└── Cancelled (cancelled, failed)
```

Alternative option:
```
My Deliveries
├── Current (active + pending)
├── Past (completed + cancelled)
```

**Implementation**:
- [ ] Add nested tabs within "My Deliveries"
- [ ] Filter deliveries by status
- [ ] Maintain consistent UI with picker's delivery view

#### 5.3 Address Display
- [ ] Shorten to format: "Street, City"
- [ ] Hide full details (postal code, country)
- [ ] Show full address only in details page
- [ ] Consider truncating long street names with ellipsis

Example:
```
Current: "ul. Marszałkowska 123/45, 00-001 Warsaw, Poland"
New:     "Marszałkowska 123, Warsaw"
```

---

### 6. /package-type Page (0.5 hours)
**Priority**: Medium
**File**: `pickom-client/app/package-type/page.tsx`

#### 6.1 Remove Duplicate Package Size Field
- [ ] Remove "Package Size" field (duplicate of Package Type)
- [ ] Keep only "Package Type" selector
- [ ] Update form validation

#### 6.2 Receiver Selection - Email/ID Input
- [ ] Replace user list dropdown with text input
- [ ] Allow input of receiver's Email OR User ID
- [ ] Add email validation
- [ ] Add search/lookup functionality
- [ ] Show receiver info after successful lookup
- [ ] Handle "receiver not found" case

**Suggested UI**:
```tsx
<TextField
  label="Receiver Email or ID"
  placeholder="Enter receiver's email or user ID"
  onChange={handleReceiverSearch}
  helperText="We'll verify if this user exists"
/>
{receiverFound && <ReceiverCard user={receiver} />}
```

---

### 7. /picker-results Page (1 hour)
**Priority**: Medium
**File**: `pickom-client/app/picker-results/page.tsx`

#### 7.1 Sort Buttons Layout
- [ ] Place "Price", "Time", "Trust" buttons in single row
- [ ] Make buttons more compact

**Better UX alternatives**:

**Option 1: Chip Buttons** (Recommended)
```tsx
<Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
  <Chip label="Price" icon={<ArrowUpDown />} onClick={sortByPrice} />
  <Chip label="Time" icon={<Clock />} onClick={sortByTime} />
  <Chip label="Rating" icon={<Star />} onClick={sortByRating} />
</Box>
```

**Option 2: Dropdown Sort**
```tsx
<Select value={sortBy} onChange={handleSort}>
  <MenuItem value="price_asc">Price: Low to High</MenuItem>
  <MenuItem value="price_desc">Price: High to Low</MenuItem>
  <MenuItem value="time_asc">Time: Fastest First</MenuItem>
  <MenuItem value="rating_desc">Rating: Highest First</MenuItem>
</Select>
```

**Option 3: Toggle Button Group**
```tsx
<ToggleButtonGroup value={sortBy} exclusive onChange={handleSort}>
  <ToggleButton value="price">💰</ToggleButton>
  <ToggleButton value="time">⏱️</ToggleButton>
  <ToggleButton value="rating">⭐</ToggleButton>
</ToggleButtonGroup>
```

#### 7.2 Filters & Sorting Consolidation
- [ ] Remove standalone "Price" button (redundant with Filters)
- [ ] Rename "Filters" to "Filters & Sorting"
- [ ] Combine all filter and sort options in single modal
- [ ] Keep UI clean with single action button

**Suggested structure**:
```
[Filters & Sorting Button]
  ↓ Opens Modal
  ├── Sort By
  │   ├── Price (Low to High / High to Low)
  │   ├── Time (Fastest First / Slowest First)
  │   └── Rating (Highest First / Lowest First)
  └── Filters
      ├── Price Range
      ├── Max Delivery Time
      ├── Min Rating
      └── Package Size
```

---

### 8. /notifications - Delivery Status Localization (0.5 hours)
**Priority**: High
**File**: `pickom-client/app/notifications/page.tsx`

- [ ] Translate all delivery statuses from Russian to English
- [ ] Check notification generation in backend
- [ ] Update frontend notification display

**Status translations needed**:
```
created → "Delivery created"
pending_confirmation → "Pending confirmation"
confirmed → "Confirmed"
pending_pickup → "Pending pickup"
in_transit → "In transit"
delivered → "Delivered"
completed → "Completed"
cancelled → "Cancelled"
```

**Files to check**:
- Backend: `pickom-server/src/notification/notification.service.ts`
- Frontend: Notification display component

---

### 9. Orders Route & Navigation Fix (1 hour)
**Priority**: Critical
**Files**:
- `pickom-client/app/delivery-methods/page.tsx`
- Offer-related pages
- Navigation logic

#### 9.1 Remove /orders Routes
- [ ] Confirm if `/orders` page exists and should be removed
- [ ] All sender deliveries should be viewed via `/delivery-methods` → "My Deliveries" tab

#### 9.2 Fix Offer Routes
**Current issue**: Redirects to `/orders/[id]` → 404 Not Found

**New route structure**:
```
Option 1: /delivery-methods/[id]/offers
Option 2: /delivery-methods/delivery-details/[id]/offers
```

**Recommended**: `/delivery-methods/[id]/offers`

- [ ] Update offer page route
- [ ] Update navigation from "My Deliveries" to offers
- [ ] Fix redirect after accepting offer

#### 9.3 Active Tab State Management
**Issue**: After redirect from offers, "My Deliveries" tab not active

**Solution**: Use localStorage or URL params
```tsx
// Option 1: localStorage
localStorage.setItem('activeTab', 'my-deliveries');

// Option 2: URL params
router.push('/delivery-methods?tab=my-deliveries');

// In page:
const searchParams = useSearchParams();
const defaultTab = searchParams.get('tab') || localStorage.getItem('activeTab') || 'send';
```

- [ ] Implement tab state persistence
- [ ] Update redirect logic to include tab param
- [ ] Test navigation flow: My Deliveries → Offers → Accept → Back to My Deliveries

---

## Implementation Order

### Phase 1: Critical Fixes (Day 1 - 3 hours)
1. Orders route & navigation fix (9)
2. /delivery-methods improvements (5)
3. /notifications status localization (8)

### Phase 2: UI Improvements (Day 2 - 3 hours)
4. /available-deliveries modals (2.3)
5. /picker-results filters & sorting (7)
6. /delivery-details scroll & layout (3)

### Phase 3: Polish (Day 2 - 2 hours)
7. Global button styling (1)
8. /package-type improvements (6)
9. /available-deliveries tabs & dates (2.1, 2.2)
10. /notifications message & theme (4)

---

## Testing Checklist

- [ ] All buttons have consistent border-radius
- [ ] Modals appear within mobile container bounds
- [ ] No duplicate scrolling on any page
- [ ] Dark theme only affects container, not entire page
- [ ] All delivery statuses in English
- [ ] Deliveries clickable and navigate correctly
- [ ] Offers route works without 404
- [ ] Active tab persists after navigation
- [ ] Receiver selection works with email/ID input
- [ ] Filters & sorting consolidated and functional
- [ ] Date formats in English
- [ ] Addresses display shortened format

---

## Files Expected to Change

### High Impact:
- `pickom-client/app/delivery-methods/page.tsx`
- `pickom-client/app/available-deliveries/page.tsx`
- `pickom-client/app/picker-results/page.tsx`
- `pickom-client/app/package-type/page.tsx`
- `pickom-client/app/notifications/page.tsx`
- `pickom-client/app/delivery-details/[id]/page.tsx`

### Possible New Files:
- `pickom-client/app/delivery-methods/[id]/offers/page.tsx`
- `pickom-client/components/ui/BottomDrawer.tsx` (for modals)

### Configuration:
- `pickom-client/tailwind.config.ts` (button radius)
- Theme provider component (dark mode scope)

---

## Success Criteria

✅ No Russian text in user-facing UI
✅ All modals properly scoped to mobile container
✅ Navigation works without 404 errors
✅ Active tab state persists
✅ Filters & sorting consolidated
✅ Consistent button styling
✅ Single scroll per page
✅ Dark theme properly scoped
✅ Deliveries sorted by newest first
✅ Addresses display in shortened format

---

## Notes

- Consider creating reusable `BottomDrawer` component for modals
- Implement consistent theme scoping pattern for all pages
- Use TypeScript enums for delivery statuses (avoid hardcoded strings)
- Add proper TypeScript types for all new components
- Maintain mobile-first responsive design
- Test on actual mobile devices when possible

# Priority Order - Frontend UI/UX Improvements

## 🔴 Critical Priority (Must Fix Immediately)

### 1. Orders Route & Navigation Fix
**Time**: 1 hour | **Impact**: Breaks user flow

**Problem**:
- Users get 404 errors when viewing offers
- Redirect after accepting offer fails
- Active tab state lost after navigation

**Fix**:
- Change route from `/orders/[id]/offers` to `/delivery-methods/[id]/offers`
- Add tab state persistence (localStorage or URL params)
- Test complete flow: My Deliveries → View Offers → Accept → Back

**Files**:
- `app/delivery-methods/[id]/offers/page.tsx` (create/move)
- Navigation redirects after offer acceptance

---

### 2. /delivery-methods - My Deliveries Tab
**Time**: 1.5 hours | **Impact**: Core sender experience

**Problems**:
- Deliveries not clickable
- Poor sorting (old deliveries first)
- No clear organization

**Fix**:
- Make deliveries clickable → `/delivery-details/[id]`
- Sort by newest first
- Add sub-tabs: Current (Active + Pending) / Past (Completed + Cancelled)
- Match picker's delivery view UX

---

### 3. Modal Windows - Container Scope
**Time**: 1 hour | **Impact**: Visual consistency

**Problems**:
- Modals take full screen width
- Don't overlay bottom navigation
- Inconsistent with mobile-first design

**Affected modals**:
- My Picker Card Preview
- Edit Picker Card
- View Card
- Make an Offer

**Fix**:
- Use MUI Drawer with bottom anchor
- Max width = mobile container width
- Overlay bottom navigation
- Add slide-up animation

---

## 🟡 High Priority (Should Fix Soon)

### 4. Localization - Russian to English
**Time**: 0.5 hours | **Impact**: Professionalism

**Locations**:
- `/notifications` - "Mark all as Read" message
- `/notifications` - All delivery statuses
- `/available-deliveries` - Date format

**Fix**:
- Replace all Russian text with English
- Change date locale to `en-US` or `en-GB`

---

### 5. Dark Theme Scope
**Time**: 0.5 hours | **Impact**: Visual consistency

**Problem**:
- Dark theme affects entire page on some screens
- Should only affect mobile container

**Fix**:
- Apply consistent scoping pattern
- Wrap only mobile container with dark theme
- Light background outside container

---

### 6. /picker-results - Filters & Sorting
**Time**: 1 hour | **Impact**: UX improvement

**Problems**:
- Redundant "Price" button
- Sort buttons not in single row
- Cluttered interface

**Fix**:
- Remove standalone "Price" button
- Rename to "Filters & Sorting"
- Consolidate all options in single modal
- Use chip buttons or toggle group for sorting

---

## 🟢 Medium Priority (Nice to Have)

### 7. /delivery-details - Scroll & Layout
**Time**: 0.5 hours

**Problems**:
- Duplicate scrolling
- Fixed component takes too much space

**Fix**:
- Single main scroll
- Move fixed component lower (sticky footer)

---

### 8. /package-type Improvements
**Time**: 0.5 hours

**Problems**:
- Duplicate "Package Size" field
- Receiver selection from list (not user-friendly)

**Fix**:
- Remove duplicate field
- Replace with Email/ID input
- Add receiver lookup functionality

---

### 9. /available-deliveries - Tab Alignment
**Time**: 0.5 hours

**Problem**:
- Tabs don't start from left edge

**Fix**:
- Remove left padding/margin
- Align with container edges

---

## 🔵 Low Priority (Polish)

### 10. Global Button Styling
**Time**: 0.5 hours

**Change**:
- Reduce border-radius on all buttons
- Use `rounded-md` instead of `rounded-lg`

---

### 11. Address Display Format
**Time**: Included in task #2

**Change**:
- Shorten from "ul. Street 123/45, 00-001 City, Country"
- To "Street 123, City"

---

## Recommended Execution Order

```
Day 1 (Morning - 3 hours):
├── Task 1: Orders Route Fix (1h) ⚡
├── Task 4: Localization (0.5h) ⚡
└── Task 2: My Deliveries Tab (1.5h) ⚡

Day 1 (Afternoon - 3 hours):
├── Task 3: Modal Container Scope (1h)
├── Task 6: Filters & Sorting (1h)
└── Task 5: Dark Theme Scope (0.5h)

Day 2 (Morning - 2 hours):
├── Task 7: Delivery Details Layout (0.5h)
├── Task 8: Package Type (0.5h)
├── Task 9: Tab Alignment (0.5h)
└── Task 10: Button Styling (0.5h)
```

---

## Quick Wins (Do First)

1. **Localization** (30 min) - High impact, low effort
2. **Orders Route Fix** (1 hour) - Fixes broken flow
3. **Button Styling** (30 min) - Global consistency

---

## Biggest Impact

1. **Orders Route & Navigation** - Prevents 404 errors
2. **My Deliveries Improvements** - Core UX for senders
3. **Modal Container Scope** - Visual consistency

---

## Dependencies

- Task 3 (Modals) → Consider creating reusable `BottomDrawer` component first
- Task 2 (My Deliveries) → Consider creating reusable `DeliveryCard` component
- Task 4 (Localization) → May need backend changes for notification messages

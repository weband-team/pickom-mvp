# Task: UI/UX Improvements - October 24, 2025

**Task ID**: uiux-improvement-2025-10-24
**Created**: 2025-10-24
**Status**: 🟡 In Progress

## 📋 Task Description

Comprehensive UI/UX improvements across multiple pages in the Pickom MVP focusing on:
- Delivery methods page tab improvements
- Modal components container scoping
- Dark theme consistency fixes
- Notification system localization
- Button styling refinements
- Navigation badge visibility

## 🎯 Goals & Success Criteria

### /delivery-methods Page
- [x] Make Current & Past subtabs UPPERCASE
- [x] Stretch subtabs to full container width
- [ ] Add "View Offers" button to all delivery cards
- [ ] Add "Search Pickers" button to delivery cards
- [ ] Ensure offers and picker search work from SENT tab

### Modal Components
- [ ] Fix all modals to fit within mobile container width (375px max)
- [ ] Ensure modals appear from bottom of mobile container, not screen
- [ ] Fix ConfirmPriceModal to use MUI instead of Tailwind
- [ ] Fix PickerCardModal maxWidth (currently 450px, should be 375px)
- [ ] Fix "Make an Offer" modal in delivery-details/[id]

### Button Styling
- [ ] Slightly increase border-radius on all buttons (subtle change)

### /profile Page
- [ ] Add earnings statistics display
- [ ] Add balance viewing capability

### /notifications Page
- [ ] Translate all Russian delivery status messages to English
- [ ] Replace BYN currency with zl (Polish Zloty)
- [ ] Fix for picker, sender, and receiver roles

### Bottom Navigation
- [ ] Add notification counter badge on all pages with bottom navigation
- [ ] Add chat message counter badge on all pages with bottom navigation

### /available-deliveries Page
- [ ] Fix tab alignment (Available, Invitations, Active, History) to start from left edge

### Dark Theme Fixes
- [ ] Fix pages: chats, chat/[id], login, user-type, register, profile/edit
- [ ] Fix LoadingIndicator components for dark theme
- [ ] Fix PickerCard styling in dark theme

### /earnings/completed Page
- [ ] Sort completed deliveries by newest first (most recent at top)

## 📁 Relevant Files

### Core Pages
- `app/delivery-methods/page.tsx` - Main delivery management page with tabs
- `app/notifications/page.tsx` - Notifications display
- `app/available-deliveries/page.tsx` - Available deliveries for pickers
- `app/profile/page.tsx` - User profile
- `app/profile/edit/page.tsx` - Profile editing
- `app/earnings/completed/page.tsx` - Completed earnings
- `app/chats/page.tsx` - Chat list
- `app/chat/[id]/ChatPageClient.tsx` - Individual chat
- `app/login/page.tsx` - Login page
- `app/user-type/page.tsx` - User type selection
- `app/register/page.tsx` - Registration

### Modal Components
- `components/modal/ConfirmPriceModal.tsx` - Price confirmation (NEEDS REWRITE)
- `components/picker/PickerCardModal.tsx` - Picker card display modal

### UI Components
- `components/ui/base/Button.tsx` - Base button component
- `components/ui/display/LoadingIndicator.tsx` - Loading states (NEEDS THEME FIX)
- `components/ui/layout/MobileContainer.tsx` - Mobile layout container
- `components/common/BottomNavigation.tsx` - Bottom navigation bar
- `components/common/ThemeWrapper.tsx` - Theme provider

### Picker Components
- `components/picker/PickerCardComponent.tsx` - Picker card display

### Server Files
- `pickom-server/src/notification/notification.service.ts` - Notification messages (RUSSIAN TEXT)
- `pickom-server/src/mocks/notification.mock.ts` - Mock notifications (RUSSIAN TEXT)

## 🔍 Context & Research

### 1. /delivery-methods Page Structure

**Main Tabs:**
```tsx
<Tabs variant="fullWidth">
  <Tab value="create" label="Create" />
  <Tab value="manage" label="Sent" />
  <Tab value="incoming" label="Incoming" />
</Tabs>
```

**SENT Tab Sub-tabs (Lines 228-245):**
```tsx
<Tabs value={subTab} onChange={(_, newValue) => setSubTab(newValue)}>
  <Tab label={`Current (${currentDeliveries.length})`} value="current" />
  <Tab label={`Past (${pastDeliveries.length})`} value="past" />
</Tabs>
```

**Issues:**
- Labels are in sentence case, need UPPERCASE
- Tabs don't use `variant="fullWidth"`
- Delivery cards are clickable but no "View Offers" or "Search Pickers" buttons

**Delivery Filtering:**
- Current: `['pending', 'accepted', 'picked_up']`
- Past: `['delivered', 'cancelled']`

### 2. Modal Component Issues

**ConfirmPriceModal (CRITICAL):**
```tsx
// Uses Tailwind with fixed positioning
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg max-w-sm w-full p-6">
```
- Uses `fixed inset-0` - breaks out of mobile container
- Hardcoded white background - no dark theme support
- NEEDS COMPLETE REWRITE to use MUI Dialog

**PickerCardModal:**
```tsx
<SwipeableDrawer
  disablePortal={false}  // SHOULD BE TRUE
  PaperProps={{
    sx: {
      maxWidth: '450px',  // TOO WIDE (container is 375px)
      margin: '0 auto',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
  }}
>
```

### 3. Dark Theme Issues

**LoadingIndicator - ALL hardcoded colors:**
```typescript
// Linear Progress
backgroundColor: '#f5f5f5',  // Always light
'& .MuiLinearProgress-bar': { backgroundColor: '#000000' }  // Always black

// Dots
backgroundColor: '#000000',  // Always black

// Circular
color: '#000000',  // Always black
```

**Pages with outer Box bgcolor issues:**
- chats, chat/[id], login, user-type, register, profile/edit
- All use `bgcolor: 'background.default'` but show loading/error states outside MobileContainer

**PickerCard:**
- Avatar uses `bgcolor: 'secondary.main'` which is '#1a1a1a' in dark theme (poor contrast)

### 4. Notification System

**Russian Messages in notification.service.ts:**
```typescript
title: "Новое предложение" → "New Offer"
message: `Курьер ${pickerName} предложил доставить вашу посылку за ${price} BYN`
→ `Courier ${pickerName} offered to deliver your package for ${price} zl`

title: "Предложение принято" → "Offer Accepted"
title: "Вам отправили посылку" → "You've Been Sent a Package"
title: "Посылка забрана" → "Package Picked Up"
```

**Currency:**
- All instances of `BYN` → `zl`
- Found in: notification.service.ts (line 137), notification.mock.ts (lines 8, 58, 68)

### 5. Bottom Navigation

**Current Implementation:**
```tsx
<Badge badgeContent={unreadNotificationsCount} sx={{ '& .MuiBadge-badge': { bgcolor: '#FF9500' } }}>
  <NotificationsIcon />
</Badge>
```

**Hook Available:**
```typescript
useNavigationBadges() // Returns { unreadChats, unreadNotifications, activeOrders }
```

### 6. Button Styling

**Current:**
```typescript
// MUI default border-radius: theme.shape.borderRadius (usually 4px)
```

**Target:** Slightly increase (suggest 6-8px for subtle rounded corners)

## 📝 Implementation Plan

### Phase 1: Critical Fixes (Day 1)
1. **ConfirmPriceModal** - Rewrite with MUI Dialog
2. **LoadingIndicator** - Fix all hardcoded colors for dark theme
3. **PickerCardModal** - Fix maxWidth and disablePortal

### Phase 2: /delivery-methods Improvements (Day 1-2)
4. Fix SENT tab subtabs styling (uppercase, fullWidth)
5. Add "View Offers" button to delivery cards
6. Add "Search Pickers" button to delivery cards
7. Wire up navigation to offers and picker search pages

### Phase 3: Localization (Day 2)
8. Translate all Russian notification messages to English
9. Replace BYN with zl across all files

### Phase 4: Dark Theme Fixes (Day 2-3)
10. Fix outer Box containers on auth pages (login, register, user-type)
11. Fix outer Box containers on chat pages (chats, chat/[id])
12. Fix profile/edit page styling
13. Fix PickerCard avatar contrast in dark theme

### Phase 5: Navigation & UI Polish (Day 3)
14. Add notification and chat badges to BottomNavigation on all pages
15. Fix /available-deliveries tab alignment
16. Update button border-radius globally
17. Add earnings statistics to /profile
18. Sort /earnings/completed by newest first

## 🧪 Testing Instructions

### Manual Testing

#### /delivery-methods Page
- [ ] Verify Current/Past tabs are UPPERCASE
- [ ] Verify tabs stretch full width
- [ ] Click "View Offers" on each delivery card
- [ ] Click "Search Pickers" on each delivery card
- [ ] Test in both light and dark themes

#### Modal Components
- [ ] Open ConfirmPriceModal - should fit within 375px mobile container
- [ ] Open PickerCardModal - should not exceed container width
- [ ] Open "Make an Offer" modal - should overlay properly
- [ ] Test all modals in dark theme

#### Dark Theme
- [ ] Navigate to each page and toggle dark theme
- [ ] Verify LoadingIndicator visible in both themes
- [ ] Verify PickerCards readable in dark theme
- [ ] Check all auth pages (login, register, user-type)
- [ ] Check chat pages (chats, chat/[id])
- [ ] Check profile/edit page

#### Notifications
- [ ] Create delivery → verify notification in English
- [ ] Accept offer → verify notification in English
- [ ] Check currency shows as "zl" not "BYN"
- [ ] Test as picker, sender, and receiver roles

#### Bottom Navigation
- [ ] Send message → verify chat badge appears
- [ ] Create notification → verify notification badge appears
- [ ] Test on all pages with bottom navigation

#### Buttons
- [ ] Check button border-radius is slightly increased
- [ ] Verify consistent across all pages

### Automated Testing
- [ ] Run `npm run lint` in pickom-client
- [ ] Run `npm run build` in pickom-client
- [ ] Run `npm run lint` in pickom-server
- [ ] Run `npm run build` in pickom-server

## 🔖 Checkpoints

*Checkpoints will be added here using /bookmark command*

## 🎨 Design Tokens

### Colors
- Mobile Container Max Width: **375px**
- Mobile Container Height: **812px** (iPhone X standard)
- Bottom Navigation Height: **70px**
- Modal Border Radius (top): **16px**
- Button Border Radius (new): **6-8px** (from ~4px)

### Theme Palette
- Dark Background: `#000000`
- Dark Paper: `#1a1a1a`
- Light Background: `#ffffff`
- Badge Orange: `#FF9500`
- Primary: `#FF9500` (Orange)
- Secondary (dark): `#1a1a1a`

## 📚 Dependencies

### Key Libraries
- MUI (Material-UI) v6
- React 19
- Next.js 15
- Tailwind CSS 4

### Related Hooks
- `useNavigationBadges()` - For badge counts
- `useNotifications()` - For notification management
- `useThemeMode()` - For theme switching

## 🔗 Related Components

### Layout
- MobileContainer
- ThemeWrapper
- BottomNavigation

### Display
- LoadingIndicator (needs fix)
- Button
- PickerCard (needs dark theme fix)

### Modals
- ConfirmPriceModal (needs rewrite)
- PickerCardModal (needs adjustment)
- MakeOfferModal (in delivery-details)

## 📋 Notes

- MobileContainer width is 375px max (iPhone X standard)
- Bottom navigation adds 70px to layout calculations
- All modals should use MUI components for theme consistency
- Avoid Tailwind for modals (causes container escape issues)
- Use `disablePortal={true}` for drawers to keep within container
- Always test in both light and dark themes
- Badge orange color: #FF9500 (consistent across app)

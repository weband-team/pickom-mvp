# Task: Orders List Feature

**Task ID**: feature-orders-list
**Created**: 2025-09-30
**Status**: 🟡 In Progress

## 📋 Task Description

Implement a comprehensive orders management system for senders in the Pickom MVP. The feature allows users to view, manage, and interact with their delivery orders across different statuses (Active, Pending, Completed, Cancelled).

### User Requirements:
- **Target User**: Senders (later will be extended to Pickers)
- **Order Types**: All delivery orders separated by status
- **Display Info**: Route, date/time, status, price, picker info (no photos initially)
- **Actions**: View details, cancel, contact picker, repeat order, leave review (phased approach)
- **Navigation**: Accessed through Profile page with badge notification for active orders

## 🎯 Goals & Success Criteria

### Phase 1: Foundation & UI (Must Have)
- [ ] Create Order type definitions and mock data
- [ ] Design and implement Orders List page with tabs (Active, Pending, Completed, Cancelled)
- [ ] Create OrderCard component with all required information
- [ ] Add "My Orders" section to Profile page
- [ ] Implement navigation from Profile to Orders List
- [ ] Add badge notification on Profile icon for active orders

### Phase 2: Details & Core Actions (Must Have)
- [ ] Create Order Details page with full order information
- [ ] Implement "View Details" action
- [ ] Implement "Contact Picker" action (navigate to chat)
- [ ] Add empty states for each tab

### Phase 3: Advanced Actions (Should Have)
- [ ] Implement "Cancel Order" action with confirmation
- [ ] Implement "Repeat Order" functionality
- [ ] Add "Leave Review" for completed orders
- [ ] Add pull-to-refresh functionality

### Phase 4: Backend Integration (Future)
- [ ] Connect to real API endpoints
- [ ] Implement real-time order status updates
- [ ] Add pagination/infinite scroll for large lists

## 📁 Relevant Files

### Types
- `types/delivery.ts` - Delivery method types (within-city, inter-city, international)
- `types/package.ts` - Package types enum
- `types/picker.ts` - Picker interface
- `types/auth.ts` - Base user data

### Pages
- `app/profile/page.tsx` - Profile page where "My Orders" link will be added
- `app/delivery-methods/page.tsx` - Delivery creation flow (reference for data structure)

### Components
- `components/profile/ProfileHeader.tsx` - Profile header component
- `components/profile/ProfileStats.tsx` - Profile stats component
- `components/common/BottomNavigation.tsx` - Bottom navigation with badge support
- `components/picker/PickerCardMemo.tsx` - Reference for card design patterns

### Theme & Styles
- `theme/colors.ts` - Color system
- `theme/theme.ts` - Theme factory

## 🔍 Context & Research

### Current Project Structure
- **Framework**: Next.js 15 with App Router
- **UI Library**: Material UI (MUI) with custom theme
- **State Management**: Zustand (not yet heavily used)
- **Mobile-first**: 375px max width container

### Order Status Flow
```
Pending → Active → Completed
    ↓
Cancelled
```

### Key Dependencies
- Material UI components: Box, Typography, Tabs, Tab, Card, Chip, IconButton
- Next.js routing: useRouter, usePathname
- Theme system: useThemeMode hook

### Related Components & Patterns
1. **PickerCardMemo** - Shows how to display user info with actions
2. **ChatListItem** - Shows list item pattern with avatar and info
3. **BottomNavigation** - Shows badge notification pattern
4. **ProfileStats** - Shows stats display pattern

### Data Structure (To Be Created)
```typescript
enum OrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface Order {
  id: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethodType;
  packageType: PackageTypeEnum;

  // Route info
  pickup: {
    address: string;
    city?: string;
    country?: string;
  };
  dropoff: {
    address: string;
    city?: string;
    country?: string;
  };

  // Timing
  createdAt: Date;
  pickupDateTime: Date;
  deliveredAt?: Date;

  // Pricing
  price: number;
  currency: string;

  // Picker info
  picker?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    rating: number;
  };

  // Additional
  notes?: string;
  trackingNumber?: string;
}
```

## 📝 Implementation Plan

### Phase 1: Foundation (Days 1-2)

#### 1.1 Create Type Definitions
- Create `types/order.ts` with Order interface and OrderStatus enum
- Create mock data in `data/mockOrders.ts`

#### 1.2 Update Profile Page
- Add "My Orders" button in Profile page
- Add badge to BottomNavigation for active orders count
- Update ProfileStats to include order counts

#### 1.3 Create Orders List Page
- Create `app/orders/page.tsx`
- Implement tab navigation (Active, Pending, Completed, Cancelled)
- Add header with back button
- Add empty states for each tab

#### 1.4 Create OrderCard Component
- Create `components/order/OrderCard.tsx`
- Display: route, date/time, status chip, price, picker info
- Add action buttons: "View Details", "Contact"
- Make it responsive and mobile-optimized

### Phase 2: Details & Actions (Days 3-4)

#### 2.1 Create Order Details Page
- Create `app/orders/[orderId]/page.tsx`
- Show full order information
- Display timeline/progress
- Add action buttons at bottom

#### 2.2 Implement Core Actions
- "View Details" - navigation to details page
- "Contact Picker" - navigation to chat with picker
- Handle empty states gracefully

#### 2.3 Polish UI/UX
- Loading states
- Transitions between tabs
- Skeleton loaders for cards

### Phase 3: Advanced Features (Days 5-6)

#### 3.1 Cancel Order
- Create confirmation dialog
- Update order status
- Show toast notification

#### 3.2 Repeat Order
- Pre-fill delivery form with order data
- Navigate to delivery-methods page

#### 3.3 Leave Review
- Create review modal/dialog
- Star rating + text review
- Show on completed orders only

#### 3.4 Pull to Refresh
- Add pull-to-refresh on orders list
- Show loading indicator
- Refresh order data

### Phase 4: Backend Integration (Future)

#### 4.1 API Integration
- Create API service for orders
- Replace mock data with real API calls
- Handle loading and error states

#### 4.2 Real-time Updates
- Implement WebSocket or polling for status updates
- Update UI when order status changes

#### 4.3 Performance Optimization
- Add pagination or infinite scroll
- Implement caching strategy
- Optimize re-renders

## 🧪 Testing Instructions

### Manual Testing

#### Phase 1: Foundation
- [ ] Navigate to Profile → "My Orders" successfully
- [ ] All tabs (Active, Pending, Completed, Cancelled) render correctly
- [ ] Badge shows correct count of active orders on Profile icon
- [ ] OrderCard displays all required information correctly
- [ ] Empty states show when no orders in tab

#### Phase 2: Details & Actions
- [ ] Click "View Details" opens order details page
- [ ] Order details page shows all information
- [ ] "Contact Picker" navigates to correct chat
- [ ] Back navigation works correctly

#### Phase 3: Advanced Actions
- [ ] Cancel order shows confirmation dialog
- [ ] Cancel order updates status and shows toast
- [ ] Repeat order pre-fills form correctly
- [ ] Leave review modal opens and submits
- [ ] Pull-to-refresh updates order list

#### Phase 4: Backend
- [ ] API calls work correctly
- [ ] Loading states display properly
- [ ] Error states handled gracefully
- [ ] Real-time updates work

### Automated Testing
- [ ] Unit tests for Order type utilities
- [ ] Component tests for OrderCard
- [ ] Integration tests for Orders page
- [ ] E2E tests for order flow

## 🎨 Design Considerations

### Color Coding by Status
- **Pending**: Yellow/Orange (#FF9500)
- **Active**: Blue (#2196F3)
- **Completed**: Green (#4CAF50)
- **Cancelled**: Grey (#9E9E9E)

### Information Hierarchy
1. **Primary**: Route (pickup → dropoff)
2. **Secondary**: Date/time, Status
3. **Tertiary**: Price, Picker info
4. **Actions**: Buttons at bottom or right

### Mobile Optimization
- Touch-friendly buttons (min 44px height)
- Clear visual hierarchy
- Swipe gestures for quick actions (future)
- Bottom sheet for actions (future)

## 🔖 Checkpoints

[Checkpoints will be added here using /bookmark command as implementation progresses]

## 📚 References

### Similar Apps for Inspiration
- Uber/Bolt: Ride history
- Amazon: Order tracking
- Glovo: Delivery status

### Material UI Components to Use
- Tabs, Tab - Tab navigation
- Card, CardContent - Order cards
- Chip - Status badges
- IconButton - Action buttons
- Dialog - Confirmation modals
- Skeleton - Loading states

## ⚠️ Important Notes

1. **Start with senders only** - picker view will be added later
2. **Mock data first** - focus on UI/UX before backend
3. **Mobile-first** - ensure everything works on 375px width
4. **Status transitions** - carefully handle order state changes
5. **Performance** - consider virtualization for long lists
6. **Accessibility** - ensure all actions are keyboard accessible

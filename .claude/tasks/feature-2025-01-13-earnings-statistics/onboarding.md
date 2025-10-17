# Task: Earnings and Statistics Pages for Picker

**Task ID**: feature-2025-01-13-earnings-statistics
**Created**: 2025-01-13
**Status**: 🟡 In Progress

## 📋 Task Description

Create comprehensive earnings and statistics pages for picker users showing their balance, earnings history, and delivery statistics. This includes balance top-up functionality through Stripe integration.

### Pages to Create:
1. `/earnings` - Main earnings dashboard
2. `/earnings/top-up` - Balance top-up flow
3. `/earnings/completed` - Completed deliveries history
4. `/earnings/cancelled` - Cancelled deliveries history

## 🎯 Goals & Success Criteria

- [ ] Display current balance from API
- [ ] Show earnings statistics (completed deliveries count, total earnings)
- [ ] Show cancelled deliveries count
- [ ] Implement "Top Up Balance" button that redirects to top-up page
- [ ] Create balance top-up flow with Stripe Checkout integration
- [ ] Display completed deliveries list with delivery details
- [ ] Display cancelled deliveries list
- [ ] All pages are mobile-first responsive
- [ ] Protected routes requiring authentication
- [ ] Error handling and loading states

## 📁 Relevant Files

### Existing Files to Reference:
- `pickom-client/app/profile/page.tsx` - Example of authenticated page structure
- `pickom-client/app/api/user.ts` - User API methods
- `pickom-client/app/api/delivery.ts` - Delivery API methods
- `pickom-client/app/api/base.ts` - Protected fetch setup
- `pickom-client/components/profile/ProfileStats.tsx` - Stats display component
- `pickom-client/components/order/OrderCard.tsx` - Order display component
- `pickom-client/components/common/BottomNavigation.tsx` - Bottom navigation
- `pickom-client/components/ui/layout/MobileContainer.tsx` - Mobile layout wrapper

### Files to Create:
- `pickom-client/app/earnings/page.tsx` - Main earnings page
- `pickom-client/app/earnings/top-up/page.tsx` - Balance top-up page
- `pickom-client/app/earnings/top-up/success/page.tsx` - Top-up success page
- `pickom-client/app/earnings/completed/page.tsx` - Completed deliveries page
- `pickom-client/app/earnings/cancelled/page.tsx` - Cancelled deliveries page
- `pickom-client/app/api/user.ts` - Add `getUserBalance()` method
- `pickom-client/app/api/delivery.ts` - Add `getCompletedDeliveries()` and `getCancelledDeliveries()` methods
- `pickom-client/app/api/payment.ts` - Add payment API methods (optional, can use direct axios)

## 🔍 Context & Research

### Key Technologies:
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Material-UI (@mui/material)
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios with protectedFetch interceptor
- **Payments**: Stripe Checkout (via backend API)
- **Auth**: Firebase Authentication

### Backend API Endpoints (Already Implemented):
1. `GET /user/:uid/balance` - Get user balance
   - Returns: `{ balance: number }`

2. `GET /delivery/completed` - Get completed deliveries
   - Requires: Firebase Auth token
   - Returns: `DeliveryRequest[]`

3. `GET /delivery/cancelled` - Get cancelled deliveries
   - Requires: Firebase Auth token
   - Returns: `DeliveryRequest[]`

4. `POST /payment/topup-balance` - Create Stripe Checkout session
   - Body: `{ userId: string, amount: number, description?: string }`
   - Returns: `{ sessionId: string, url: string }`

### Existing Patterns:
1. **Authentication Flow**:
   - Use `handleMe()` from `app/api/auth.ts` to get current user
   - Use `protectedFetch` for authenticated API calls
   - Redirect to `/login` if not authenticated

2. **Page Structure**:
   ```tsx
   'use client';
   - useState for local state
   - useEffect for data fetching
   - Loading spinner while fetching
   - Error handling with Material-UI Alert
   - MobileContainer + BottomNavigation layout
   ```

3. **API Calls**:
   - Import `protectedFetch` from `./base`
   - Async functions exported from API modules
   - TypeScript interfaces for request/response

4. **UI Components**:
   - Material-UI Box, Typography, Button, Card
   - Custom components from `components/` directory
   - Responsive design with `sx` prop

### Reference Implementation (qire-243 branch):
- `BalanceTopUpTest.tsx` component shows:
  - Form with userId, amount, description inputs
  - axios.post to `/payment/topup-balance`
  - Redirect to `window.location.href = url` (Stripe Checkout)
  - Success/error handling with toast notifications

## 📝 Implementation Plan

### Phase 1: API Client Methods
1. Add `getUserBalance(uid: string)` to `app/api/user.ts`
2. Add `getCompletedDeliveries()` to `app/api/delivery.ts`
3. Add `getCancelledDeliveries()` to `app/api/delivery.ts`

### Phase 2: Main Earnings Page (`/earnings`)
1. Create `app/earnings/page.tsx`
2. Fetch current user with `handleMe()`
3. Fetch balance with `getUserBalance(user.uid)`
4. Fetch completed and cancelled deliveries counts
5. Display:
   - Current Balance with currency formatting
   - "Top Up Balance" button
   - Statistics cards:
     - Completed deliveries count
     - Total earnings (sum of completed delivery prices)
     - Cancelled deliveries count
   - Navigation buttons to completed/cancelled pages
6. Add loading and error states
7. Use BottomNavigation

### Phase 3: Balance Top-Up Pages
1. Create `app/earnings/top-up/page.tsx`:
   - Get current user
   - Show balance
   - Amount input (with validation: min $1, max $1000)
   - Description input (optional)
   - "Continue to Payment" button
   - Call `POST /payment/topup-balance`
   - Redirect to Stripe Checkout URL

2. Create `app/earnings/top-up/success/page.tsx`:
   - Show success message
   - Display updated balance
   - Button to return to earnings page

### Phase 4: Delivery History Pages
1. Create `app/earnings/completed/page.tsx`:
   - Fetch completed deliveries
   - Display list using OrderCard or custom card
   - Show: title, date, price, from/to addresses
   - Empty state if no completed deliveries
   - Back button to earnings

2. Create `app/earnings/cancelled/page.tsx`:
   - Same structure as completed
   - Show cancelled deliveries

### Phase 5: Polish & Testing
1. Add TypeScript types for all responses
2. Error boundary wrapping
3. Responsive design verification
4. Loading skeleton states
5. Currency formatting ($XX.XX)
6. Date formatting for deliveries

## 🧪 Testing Instructions

### Manual Testing

#### Earnings Page
- [ ] Navigate to `/earnings`
- [ ] Verify balance displays correctly
- [ ] Verify statistics show correct numbers
- [ ] Click "Top Up Balance" - should navigate to `/earnings/top-up`
- [ ] Click "View Completed" - should navigate to `/earnings/completed`
- [ ] Click "View Cancelled" - should navigate to `/earnings/cancelled`

#### Top-Up Flow
- [ ] Navigate to `/earnings/top-up`
- [ ] Enter amount < $1 - should show validation error
- [ ] Enter amount > $1000 - should show validation error
- [ ] Enter valid amount (e.g., $50)
- [ ] Click "Continue to Payment"
- [ ] Verify redirect to Stripe Checkout
- [ ] Complete payment in Stripe test mode
- [ ] Verify redirect to `/earnings/top-up/success`
- [ ] Verify updated balance on success page
- [ ] Click "Back to Earnings" - should return to `/earnings`

#### Delivery History
- [ ] Navigate to `/earnings/completed`
- [ ] Verify list of completed deliveries displays
- [ ] Check each delivery shows: title, price, addresses, date
- [ ] Navigate to `/earnings/cancelled`
- [ ] Verify list of cancelled deliveries displays
- [ ] Test back button navigation

#### Edge Cases
- [ ] Test with 0 balance
- [ ] Test with no completed deliveries (empty state)
- [ ] Test with no cancelled deliveries (empty state)
- [ ] Test without authentication (should redirect to login)
- [ ] Test API errors (network failure, 500 error)
- [ ] Test loading states

### Automated Testing
- [ ] Unit tests for API methods
- [ ] Integration tests for page components
- [ ] E2E tests for complete user flow (optional)

## 🔖 Dependencies & Prerequisites

### Backend (Already Implemented)
- ✅ `GET /user/:uid/balance` endpoint
- ✅ `GET /delivery/completed` endpoint
- ✅ `GET /delivery/cancelled` endpoint
- ✅ `POST /payment/topup-balance` endpoint
- ✅ Stripe webhook configuration

### Frontend Dependencies
- ✅ Material-UI installed
- ✅ Axios installed
- ✅ Firebase Auth configured
- ✅ protectedFetch interceptor setup
- ✅ MobileContainer component
- ✅ BottomNavigation component

### Environment Variables
- `NEXT_PUBLIC_SERVER` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key (if needed for client-side)

## 📌 Notes

- Focus on picker role only for this task
- Sender earnings/statistics will be separate task
- Use Material-UI for consistency with existing pages
- Follow mobile-first design principles
- All monetary values in USD
- Date formatting should match existing patterns in the app
- Consider adding loading skeletons for better UX
- Use toast notifications for success/error messages

## 🔖 Checkpoints

_(Checkpoints will be added here using /bookmark command during implementation)_

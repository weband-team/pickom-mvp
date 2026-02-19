# Task: Sender Balance & Payment System

**Task ID**: `feature-2025-10-16-sender-balance-payment`
**Created**: 2025-10-16
**Status**: 🟡 In Progress

## 📋 Task Description

Currently, senders have a "My Balance" button in their profile, but they cannot access the earnings page because it's restricted to pickers only. We need to:

1. **Make earnings page accessible to senders** - but with different UI (no "Total Earnings" field since senders don't earn money)
2. **Implement payment deduction on offer acceptance** - when a sender accepts an offer, the delivery price should be deducted from their balance
3. **Add balance validation** - if sender has insufficient funds, show error and redirect to top-up page
4. **Only allow order confirmation with sufficient balance** - sender must top up before accepting an offer

## 🎯 Goals & Success Criteria

- [ ] Senders can access /earnings page and see their balance
- [ ] Senders see different UI (no "Total Earnings" card, only balance and top-up option)
- [ ] When sender accepts an offer, their balance is checked first
- [ ] If balance insufficient, show error modal with "Top Up Balance" button
- [ ] If balance sufficient, deduct amount and proceed with offer acceptance
- [ ] Backend properly handles balance deduction in transaction
- [ ] Picker receives payment when delivery is completed (future enhancement)

## 📁 Relevant Files

### Frontend (Client)
- `pickom-client/app/earnings/page.tsx` - Main earnings page (currently picker-only, lines 32-36 check role)
- `pickom-client/app/earnings/top-up/page.tsx` - Balance top-up page (already implemented)
- `pickom-client/app/orders/[id]/offers/page.tsx` - Offer acceptance page (lines 165-221 handle accept, NO balance check)
- `pickom-client/app/profile/page.tsx` - Profile page with "My Balance" button (line 292)
- `pickom-client/app/api/user.ts` - User API methods (getUserBalance at line 47)
- `pickom-client/app/api/delivery.ts` - Delivery API methods
- `pickom-client/app/api/offers.ts` - Offers API methods (need to check if exists)

### Backend (Server)
- `pickom-server/src/user/entities/user.entity.ts` - User entity with balance field (line 61-67)
- `pickom-server/src/payment/payment.service.ts` - Payment service with topUpBalance (line 511)
- `pickom-server/src/payment/payment.controller.ts` - Payment controller (line 80-83)
- `pickom-server/src/offer/offer.service.ts` - Offer service (updateOfferStatus at line 57-81)
- `pickom-server/src/delivery/delivery.service.ts` - Delivery service (need to check)
- `pickom-server/src/user/user.service.ts` - User service (need to add balance deduction method)

## 🔍 Context & Research

### Current Flow - Offer Acceptance
1. Sender views offers at `/orders/[id]/offers`
2. Sender clicks "Accept" on an offer
3. Frontend calls `updateOfferStatus(offerId, { status: 'accepted' })`
4. Frontend calls `updateDeliveryRequest(deliveryId, { pickerId, status: 'accepted' })`
5. Frontend auto-rejects other pending offers
6. **❌ NO balance check or payment deduction happens!**

### Payment System
- Backend has Stripe integration for balance top-up
- User entity has `balance` field (decimal 10,2)
- Payment service handles:
  - `topUpBalance()` - adds money to user balance
  - Webhook handlers update balance after successful payment
  - Balance updates happen in transactions

### Key Dependencies
- **Material-UI** - for UI components (Dialog, Alert, etc.)
- **Axios** - for API calls
- **Stripe** - for payment processing (already integrated)
- **TypeORM** - for database transactions (balance updates)

### Related Components
- `OfferCard` component - displays offer with Accept/Reject buttons
- `MobileContainer` - mobile-first layout wrapper
- `BottomNavigation` - navigation bar

## 📝 Implementation Plan

### Phase 1: Frontend - Earnings Page for Senders
1. **Modify earnings page role check**
   - Remove picker-only restriction (lines 32-36)
   - Check user role to conditionally render UI

2. **Create role-based UI rendering**
   - For pickers: show Current Balance, Total Earnings, Completed/Cancelled deliveries
   - For senders: show Current Balance, Top Up button, Completed/Cancelled orders (sent)
   - Hide "Total Earnings" card for senders

3. **Update statistics queries**
   - Pickers: fetch completed/cancelled deliveries they picked
   - Senders: fetch completed/cancelled deliveries they sent

### Phase 2: Backend - Balance Deduction Logic
1. **Create balance deduction method in UserService**
   - `deductBalance(uid: string, amount: number): Promise<void>`
   - Check if user has sufficient balance
   - Throw `BadRequestException` if insufficient
   - Use TypeORM transaction for atomic update

2. **Modify OfferService.updateOfferStatus**
   - When status is 'accepted', deduct amount from sender's balance
   - Get delivery to find sender
   - Call `userService.deductBalance(senderUid, offer.price)`
   - Wrap in transaction with offer status update

3. **Create Payment record**
   - When offer accepted, create Payment entity
   - `fromUserId`: sender
   - `toUserId`: picker (will receive funds on delivery completion)
   - `amount`: offer price
   - `status`: 'pending'
   - `deliveryId`: delivery ID

### Phase 3: Frontend - Balance Validation on Offer Acceptance
1. **Add balance check before accepting offer**
   - Fetch user balance before showing confirmation dialog
   - Compare balance with offer price

2. **Create insufficient funds dialog**
   - Show error message: "Insufficient balance. Please top up to accept this offer."
   - Display current balance and required amount
   - Show "Top Up Balance" button → redirects to `/earnings/top-up`
   - Show "Cancel" button

3. **Modify handleConfirmAction**
   - Before calling `updateOfferStatus`, check balance
   - If insufficient, show insufficent funds dialog
   - If sufficient, proceed with acceptance
   - Handle backend errors (e.g., insufficient balance race condition)

### Phase 4: Error Handling & Edge Cases
1. **Handle concurrent offer acceptances**
   - If sender accepts offer while another is being processed
   - Backend should prevent if balance insufficient

2. **Handle balance updates during acceptance**
   - If balance changes during offer acceptance flow
   - Re-fetch balance before final confirmation

3. **User feedback**
   - Toast notifications for successful/failed operations
   - Clear error messages for insufficient balance
   - Loading states during API calls

## 🧪 Testing Instructions

### Manual Testing - Senders

#### Test 1: Access Earnings Page
- [ ] Login as sender
- [ ] Navigate to /profile
- [ ] Click "My Balance" button
- [ ] Verify earnings page loads (no error)
- [ ] Verify no "Total Earnings" card is shown
- [ ] Verify "Top Up Balance" button is visible

#### Test 2: Accept Offer with Sufficient Balance
- [ ] Top up balance to $50
- [ ] Create delivery request
- [ ] Wait for picker to make offer of $20
- [ ] Navigate to offers page
- [ ] Click "Accept" on offer
- [ ] Verify balance check passes
- [ ] Verify offer is accepted
- [ ] Verify balance is reduced by $20 (now $30)

#### Test 3: Accept Offer with Insufficient Balance
- [ ] Set balance to $10
- [ ] Create delivery request
- [ ] Wait for picker to make offer of $20
- [ ] Navigate to offers page
- [ ] Click "Accept" on offer
- [ ] Verify error dialog appears
- [ ] Verify message shows insufficient balance
- [ ] Click "Top Up Balance" button
- [ ] Verify redirected to /earnings/top-up
- [ ] Top up balance by $20
- [ ] Return to offers and accept
- [ ] Verify acceptance succeeds

#### Test 4: Multiple Offers
- [ ] Create delivery with balance $50
- [ ] Get 3 offers: $15, $20, $25
- [ ] Accept $20 offer
- [ ] Verify balance becomes $30
- [ ] Verify other offers auto-rejected
- [ ] Verify no additional balance deductions

### Manual Testing - Pickers

#### Test 1: Picker Earnings Page Unchanged
- [ ] Login as picker
- [ ] Navigate to /earnings
- [ ] Verify page loads normally
- [ ] Verify "Total Earnings" card is visible
- [ ] Verify completed deliveries shown
- [ ] Verify functionality unchanged

### Automated Testing
- [ ] Unit tests for UserService.deductBalance
- [ ] Unit tests for balance validation logic
- [ ] Integration tests for offer acceptance flow
- [ ] E2E tests for complete payment flow

## 🔧 Technical Decisions

### Why deduct balance on offer acceptance, not delivery creation?
- Delivery price is set by picker's offer, not known at creation time
- Sender can choose from multiple offers with different prices
- This matches real-world marketplace behavior

### Why use transactions for balance updates?
- Prevents race conditions (concurrent offer acceptances)
- Ensures atomicity (balance deducted only if offer accepted)
- Maintains data consistency

### Why create Payment record immediately?
- Provides audit trail of all financial transactions
- Allows tracking payment status throughout delivery lifecycle
- Enables future features (refunds, disputes, etc.)

## 🚨 Edge Cases & Considerations

1. **Delivery cancellation** - Should balance be refunded to sender?
   - Future enhancement: refund policy

2. **Picker never completes delivery** - How long is balance held?
   - Future enhancement: timeout and automatic refund

3. **Dispute resolution** - What if delivery has issues?
   - Future enhancement: dispute system with escrow

4. **Currency conversion** - All prices in USD for MVP
   - Future enhancement: multi-currency support

5. **Payment processing fees** - Who pays Stripe fees?
   - Current: Absorbed by platform
   - Future enhancement: pass fees to sender

## 📚 Related Documentation

- Payment Flow: `pickom-server/src/payment/payment.service.ts`
- Stripe Integration: Environment variable `STRIPE_SECRET_KEY`
- Balance Top-up: `pickom-client/app/earnings/top-up/page.tsx`
- User Entity: `pickom-server/src/user/entities/user.entity.ts`

## 🔖 Checkpoints

*Checkpoints will be added here using /bookmark command as implementation progresses*

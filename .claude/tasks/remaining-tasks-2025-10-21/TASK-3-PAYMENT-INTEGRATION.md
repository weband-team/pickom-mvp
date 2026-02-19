# Task 3: Payment Integration (Stripe)

**Priority**: High
**Estimated Time**: 4-6 hours
**Status**: Not Started
**Dependencies**: None

---

## Overview

Integrate Stripe payment system to handle:
1. Delivery payments from senders
2. Picker payouts
3. User balance management
4. Transaction history

---

## Phase 1: Backend Setup (1.5 hours)

### 1.1 Environment Setup
- [ ] Add Stripe secret key to `.env`
- [ ] Add webhook secret to `.env`
- [ ] Install Stripe SDK: `npm install stripe`

### 1.2 Stripe Service Enhancement
**File**: `pickom-server/src/payment/payment.service.ts`

- [ ] Add method to create Stripe customer for new users
- [ ] Enhance `createPaymentIntent()` for delivery payments
- [ ] Add `createConnectAccount()` for picker payouts
- [ ] Add `processDeliveryPayment()` method
- [ ] Add `processPickerPayout()` method
- [ ] Enhance webhook handler for relevant events:
  - `payment_intent.succeeded`
  - `payment_intent.failed`
  - `account.updated`
  - `transfer.created`

### 1.3 User Service Integration
**File**: `pickom-server/src/user/user.service.ts`

- [ ] Add `stripeCustomerId` field to User entity (migration needed)
- [ ] Add `stripeAccountId` field for pickers (Stripe Connect)
- [ ] Add `balance` field to User entity
- [ ] Create method to auto-create Stripe customer on user registration

### 1.4 Payment Endpoints
**File**: `pickom-server/src/payment/payment.controller.ts`

Already exists, but enhance:
- [ ] `POST /payment/delivery/:id/pay` - Pay for delivery
- [ ] `POST /payment/balance/topup` - Top up user balance
- [ ] `POST /payment/picker/payout` - Request payout (picker)
- [ ] `GET /payment/transactions` - Get transaction history
- [ ] `GET /payment/balance` - Get current balance

---

## Phase 2: Balance System (1 hour)

### 2.1 Transaction Entity
**File**: `pickom-server/src/payment/entities/transaction.entity.ts`

Create new entity:
```typescript
{
  id: number;
  userId: number;
  type: 'topup' | 'payment' | 'payout' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  deliveryId?: number;
  description: string;
  createdAt: Date;
}
```

### 2.2 Balance Management
- [ ] Add `updateBalance()` method in user service
- [ ] Add `getBalance()` endpoint
- [ ] Add `getTransactionHistory()` endpoint
- [ ] Implement balance deduction on delivery payment
- [ ] Implement balance increase on payout

---

## Phase 3: Delivery Payment Flow (1.5 hours)

### 3.1 Payment Process
**When sender accepts picker offer**:

1. Calculate total amount (delivery price + fees)
2. Check sender's balance
3. If insufficient balance → redirect to top-up
4. If sufficient → deduct from balance
5. Create transaction record
6. Update delivery status to `paid`
7. Notify picker

### 3.2 Backend Implementation
**File**: `pickom-server/src/delivery/delivery.service.ts`

- [ ] Add `payForDelivery()` method
- [ ] Integrate with payment service
- [ ] Add balance check
- [ ] Create transaction on success
- [ ] Send notifications

### 3.3 API Endpoint
- [ ] `POST /delivery/:id/pay`
  - Request: `{ paymentMethod: 'balance' | 'card' }`
  - Response: `{ success: boolean, transactionId, newBalance }`

---

## Phase 4: Picker Payout System (1 hour)

### 4.1 Stripe Connect Setup
- [ ] Create Stripe Connect account for pickers
- [ ] Add onboarding flow for pickers
- [ ] Store `stripeAccountId` in user record

### 4.2 Payout Logic
**When delivery is completed and confirmed by receiver**:

1. Calculate picker earnings (delivery price - platform fee)
2. Create transfer to picker's Stripe Connect account
3. Update picker's balance
4. Create transaction record
5. Notify picker

### 4.3 Backend Implementation
**File**: `pickom-server/src/payment/payment.service.ts`

- [ ] Add `createPickerPayout()` method
- [ ] Integrate with delivery completion
- [ ] Calculate platform fees
- [ ] Create Stripe transfer
- [ ] Record transaction

---

## Phase 5: Frontend Integration (2 hours)

### 5.1 Payment Setup Page
**File**: `pickom-client/app/payment-setup/page.tsx` (NEW)

- [ ] Display current balance
- [ ] Top-up balance button
- [ ] Payment method management
- [ ] Connect bank account (for pickers)

### 5.2 Balance Top-Up Page
**File**: `pickom-client/app/balance/topup/page.tsx` (NEW)

- [ ] Amount input (preset amounts + custom)
- [ ] Stripe payment element
- [ ] Confirmation UI
- [ ] Success/failure handling

### 5.3 Transaction History Page
**File**: `pickom-client/app/transactions/page.tsx` (NEW)

- [ ] List all transactions
- [ ] Filter by type (topup, payment, payout)
- [ ] Show transaction details
- [ ] Export functionality

### 5.4 API Client Functions
**File**: `pickom-client/app/api/payment.ts`

```typescript
export const createTopUpIntent = (amount: number): Promise<PaymentIntent>
export const payForDelivery = (deliveryId: number): Promise<Transaction>
export const getBalance = (): Promise<{ balance: number, currency: string }>
export const getTransactions = (): Promise<Transaction[]>
export const createPickerPayoutAccount = (): Promise<{ accountId: string, onboardingUrl: string }>
```

### 5.5 UI Components
- [ ] BalanceCard component - Show current balance
- [ ] TransactionListItem component - Display transaction
- [ ] PaymentMethodCard component - Show payment methods
- [ ] TopUpButton component - Quick top-up

---

## Phase 6: Testing (1 hour)

### 6.1 Stripe CLI Testing
```bash
# Terminal 1: Start webhook listener
stripe listen --forward-to localhost:4242/payment/webhook

# Terminal 2: Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.failed
```

### 6.2 Test Scenarios
- [ ] Top up balance successfully
- [ ] Top up balance with failed payment
- [ ] Pay for delivery with sufficient balance
- [ ] Pay for delivery with insufficient balance
- [ ] Picker receives payout after delivery completion
- [ ] Transaction history shows all transactions
- [ ] Balance updates correctly
- [ ] Webhook events are processed correctly

### 6.3 Test Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

---

## Database Migrations

### Migration 1: Add Stripe fields to User
```sql
ALTER TABLE users
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_account_id VARCHAR(255),
ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00;
```

### Migration 2: Create Transaction table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PLN',
  status VARCHAR(50) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  delivery_id INTEGER REFERENCES deliveries(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Platform Fees
PLATFORM_FEE_PERCENTAGE=10
MINIMUM_PAYOUT_AMOUNT=50
```

---

## Security Considerations

- [ ] Validate all amounts on backend
- [ ] Prevent negative balances
- [ ] Implement rate limiting on payment endpoints
- [ ] Log all payment operations
- [ ] Encrypt sensitive data
- [ ] Verify webhook signatures
- [ ] Implement idempotency keys for payments

---

## Success Criteria

- ✅ Users can top up balance
- ✅ Senders can pay for deliveries
- ✅ Pickers receive payouts
- ✅ Transaction history is accurate
- ✅ Balance updates in real-time
- ✅ Webhooks are processed correctly
- ✅ Errors are handled gracefully
- ✅ All payments are logged

---

## Rollout Plan

1. Deploy backend changes
2. Test with Stripe test mode
3. Add frontend UI
4. Test complete flows
5. Enable for beta users
6. Monitor for issues
7. Full rollout

---

## Support & Documentation

- Stripe API Docs: https://stripe.com/docs/api
- Stripe Connect Guide: https://stripe.com/docs/connect
- Stripe Testing: https://stripe.com/docs/testing
- Webhook Events: https://stripe.com/docs/webhooks

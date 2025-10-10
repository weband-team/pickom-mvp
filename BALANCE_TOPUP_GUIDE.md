# Balance Top-Up Feature Guide

## Overview
This guide explains how to use the balance top-up feature that allows users to add funds to their account balance via Stripe payment.

## Backend Implementation

### 1. DTO (Data Transfer Object)
**File:** `pickom-server/src/payment/dto/topup-balance.dto.ts`

```typescript
export class TopUpBalanceDto {
  userId: string;      // Firebase UID of the user
  amount: number;      // Amount to add (minimum $1)
  description?: string; // Optional description
}
```

### 2. Service Method
**File:** `pickom-server/src/payment/payment.service.ts`

The `topUpBalance()` method:
- Validates user exists by Firebase UID
- Creates Stripe Checkout Session
- Saves payment record in database with `type: 'balance_topup'`
- Returns session URL for redirect

### 3. Webhook Handling
The webhook handlers (`handleCheckoutSessionCompleted` and `handlePaymentIntentSucceeded`) now check if payment is a balance top-up:
- If `metadata.type === 'balance_topup'`: Only increments user's balance
- Otherwise: Normal payment flow (decrement from sender, increment to receiver)

### 4. API Endpoint
**Endpoint:** `POST /payment/topup-balance`

**Request Body:**
```json
{
  "userId": "firebase_uid_here",
  "amount": 50.00,
  "description": "Balance top-up"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

## Frontend Implementation

### 1. Component
**File:** `pickom-client/app/components/BalanceTopUpTest.tsx`

A React component that:
- Accepts Firebase UID input
- Validates amount (minimum $1)
- Sends request to backend
- Redirects to Stripe Checkout

### 2. Test Page
**URL:** `/test-balance-topup`
**File:** `pickom-client/app/test-balance-topup/page.tsx`

### 3. Success Page
**URL:** `/test-balance-topup/success`
**File:** `pickom-client/app/test-balance-topup/success/page.tsx`

## How to Test

### Prerequisites
1. Ensure Stripe is configured:
   - `STRIPE_SECRET_KEY` in server `.env`
   - `STRIPE_WEBHOOK_SECRET` in server `.env`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in client `.env`
2. Start the server: `cd pickom-server && npm run start:dev`
3. Start the client: `cd pickom-client && npm run dev`
4. Ensure Stripe webhook is set up (use Stripe CLI or ngrok)

### Testing Steps

1. **Get a Firebase UID:**
   - Go to Firebase Console → Authentication
   - Copy any user's UID

2. **Access the test page:**
   - Navigate to: `http://localhost:3000/test-balance-topup`

3. **Fill the form:**
   - Enter Firebase UID
   - Enter amount (e.g., 25.00)
   - Add optional description

4. **Complete payment:**
   - Click "Top Up" button
   - Use test card: `4242 4242 4242 4242`
   - Use any future expiry date and any CVC
   - Complete Stripe Checkout

5. **Verify success:**
   - You'll be redirected to success page
   - Check database: user's balance should be increased
   - Check server logs for webhook processing

### Test Card Numbers
- **Success:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155

## Database Changes

When a balance top-up payment succeeds:
1. Payment record is created with `status: 'completed'`
2. Payment metadata includes `type: 'balance_topup'`
3. User's balance field is incremented by the payment amount
4. No balance is deducted from any user (unlike regular payments)

## API Flow

```
1. Client → POST /payment/topup-balance
2. Server validates user and creates Stripe session
3. Client redirects to Stripe Checkout
4. User completes payment
5. Stripe → Webhook to server
6. Server updates payment status and user balance
7. Stripe redirects to success page
```

## Important Notes

- Balance top-up uses Stripe Checkout (not Payment Intents directly)
- Minimum amount is $1
- Only increments balance (no deduction from other users)
- Success/cancel URLs are configured in the session
- Webhook handles the actual balance update
- All amounts are in USD

## Error Handling

Common errors:
- **User not found:** Returns 404 if Firebase UID doesn't exist
- **Invalid amount:** Validation fails for amounts less than $1
- **Stripe error:** Returns error message from Stripe
- **Webhook failure:** Check server logs and Stripe dashboard

## Security Considerations

- Always validate user exists before creating payment
- Use Firebase UID (not internal user ID) for external API calls
- Webhook signature is verified automatically
- Transactions are atomic (payment + balance update)

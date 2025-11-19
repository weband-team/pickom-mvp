# Task: Receiver Confirmation & Unified Chat

**Task ID**: receiver-confirmation-and-unified-chat-2025-10-21
**Created**: 2025-10-21
**Priority**: 🔴 HIGH
**Estimated Time**: 2-3 days
**Status**: 🟡 Planning

---

## 📋 Task Overview

Implement complete receiver functionality including:
1. **Receiver confirmation flow** - receiver must confirm delivery receipt
2. **Receiver input improvement** - change from user list to Email/ID input
3. **Unified chat for picker** - merge sender & receiver chats into tabbed interface

---

## 🎯 Goals & Success Criteria

### Goal 1: Receiver Confirmation Flow
- [x] Receiver can see incoming deliveries in their dashboard
- [x] Receiver gets notification when delivery is "picked_up"
- [x] Receiver can confirm delivery receipt
- [x] Status changes to "delivered" after confirmation
- [x] Proper error handling if receiver rejects/reports issue

### Goal 2: Receiver Input Method
- [x] Remove user list dropdown
- [x] Add Email or Firebase UID input field
- [x] Backend validates email/UID exists
- [x] Auto-populate receiver details if found
- [x] Support for guest receivers (phone only)

### Goal 3: Unified Chat for Picker
- [x] Single chat interface with tabs: "Sender" | "Receiver"
- [x] Chat sessions linked to delivery
- [x] Proper participant identification
- [x] Badge for unread messages on tabs
- [x] Smooth tab switching

---

## 🔍 Current State Analysis

### What Exists:
✅ `recipientId` and `recipientPhone` in Delivery entity
✅ `recipientConfirmed` boolean field
✅ Chat sessions with sender, picker, recipient
✅ Notification system

### What's Missing:
❌ No receiver confirmation UI/flow
❌ Receiver input is user select dropdown
❌ Picker has separate chats (not unified)
❌ No notification when delivery ready for pickup
❌ recipientConfirmed not used in flow

---

## 📁 Files to Modify

### Frontend - New Components:

1. **`pickom-client/components/ReceiverConfirmation.tsx`**
   - Confirmation dialog for receiver
   - Shows delivery details
   - Confirm/Report Issue buttons
   - Photo upload (optional proof)

2. **`pickom-client/components/UnifiedChatTabs.tsx`**
   - Tabbed interface for picker
   - Tab: Sender chat
   - Tab: Receiver chat
   - Unread badges
   - Smooth transitions

3. **`pickom-client/components/ReceiverInput.tsx`**
   - Email or UID input field
   - Validation & search
   - Display found user info
   - Fallback to phone input

### Frontend - Modified Pages:

4. **`pickom-client/app/package-type/page.tsx`**
   - Replace receiver select → ReceiverInput component
   - Handle email/UID submission
   - Show receiver details preview

5. **`pickom-client/app/delivery-details/[id]/page.tsx`**
   - Add ReceiverConfirmation for receivers
   - Show confirmation status
   - Update status display

6. **`pickom-client/app/chat/page.tsx`** (or create picker chat page)
   - Integrate UnifiedChatTabs for pickers
   - Load both sender & receiver sessions
   - Handle tab switching

7. **`pickom-client/app/delivery-methods/page.tsx`**
   - Add "Incoming" tab for receivers
   - Show deliveries where user is recipient
   - Pending confirmation indicator

### Backend - DTOs:

8. **`pickom-server/src/delivery/dto/confirm-delivery.dto.ts`** (NEW)
   ```typescript
   export class ConfirmDeliveryDto {
     confirmed: boolean;
     notes?: string;
     photoUrl?: string; // optional proof
     reportIssue?: boolean;
     issueDescription?: string;
   }
   ```

9. **`pickom-server/src/user/dto/find-receiver.dto.ts`** (NEW)
   ```typescript
   export class FindReceiverDto {
     emailOrUid: string;
   }
   ```

### Backend - Services:

10. **`pickom-server/src/delivery/delivery.service.ts`**
    - Add `confirmDeliveryByReceiver()` method
    - Add `findReceiverByEmailOrUid()` method
    - Update status flow: picked_up → delivered (after confirmation)
    - Send notification to picker on confirmation

11. **`pickom-server/src/user/user.service.ts`**
    - Add `findByEmailOrUid()` method
    - Return user if exists, null otherwise

12. **`pickom-server/src/chat/chat.service.ts`**
    - Add `getUnifiedSessionsForPicker()` method
    - Returns both sender & receiver sessions for delivery
    - Include unread count per session

13. **`pickom-server/src/notification/notification.service.ts`**
    - Add `notifyReceiverPickedUp()` - delivery ready for receipt
    - Add `notifyPickerConfirmed()` - receiver confirmed
    - Update notification types

### Backend - Controllers:

14. **`pickom-server/src/delivery/delivery.controller.ts`**
    - POST `/delivery/:id/confirm` - receiver confirms
    - GET `/delivery/incoming` - get deliveries for receiver
    - POST `/delivery/find-receiver` - search by email/UID

15. **`pickom-server/src/chat/chat.controller.ts`**
    - GET `/chat/delivery/:deliveryId/unified` - unified sessions

---

## 🏗️ Implementation Plan

### Phase 1: Backend - Receiver Search & Confirmation (Day 1)

**Step 1.1: Find Receiver Endpoint**
- Create `FindReceiverDto`
- Add `findByEmailOrUid()` in user.service
- Add POST `/delivery/find-receiver` endpoint
- Return user: { uid, name, email, avatarUrl } or null

**Step 1.2: Confirm Delivery Endpoint**
- Create `ConfirmDeliveryDto`
- Add `confirmDeliveryByReceiver()` in delivery.service
- Validate: only recipient can confirm
- Validate: delivery status is 'picked_up'
- Update: `recipientConfirmed = true`, `status = 'delivered'`
- Notify picker of confirmation
- Add POST `/delivery/:id/confirm`

**Step 1.3: Incoming Deliveries Endpoint**
- Add GET `/delivery/incoming` (auth required)
- Filter deliveries where recipientId = currentUser
- Return deliveries with sender & picker info

**Step 1.4: Notifications**
- Add `notifyReceiverPickedUp()` when status → picked_up
- Add `notifyPickerConfirmed()` when receiver confirms
- Update notification redirect URLs

### Phase 2: Backend - Unified Chat (Day 1-2)

**Step 2.1: Unified Chat Sessions**
- Add `getUnifiedSessionsForPicker()` in chat.service
- Find sender session (pickerId = user, senderId = sender)
- Find receiver session (pickerId = user, recipientId = receiver)
- Return both with unread counts
- Add GET `/chat/delivery/:deliveryId/unified`

**Step 2.2: Update Chat Session Structure**
- Ensure chat_sessions has recipientId (already exists)
- Add index on deliveryId for faster queries
- Test both sessions load correctly

### Phase 3: Frontend - Receiver Input (Day 2)

**Step 3.1: ReceiverInput Component**
```tsx
- Input field: "Enter receiver email or UID"
- onChange debounced search (300ms)
- Call POST /delivery/find-receiver
- Show user card if found
- Show "Not found" if null
- Option: "Use phone number instead"
```

**Step 3.2: Update package-type Page**
- Remove `<select>` for receiver
- Add `<ReceiverInput />`
- Store receiver: { type: 'user', uid } or { type: 'phone', phone }
- Update form submission

**Step 3.3: API Integration**
- Create `findReceiver(emailOrUid)` in api/user.ts
- Handle response
- Update CreateDeliveryRequest to accept receiver data

### Phase 4: Frontend - Receiver Confirmation (Day 2-3)

**Step 4.1: Incoming Deliveries Tab**
- Add "Incoming" tab in /delivery-methods
- Fetch GET `/delivery/incoming`
- Show deliveries with "Confirm Receipt" badge
- Click → /delivery-details/[id]

**Step 4.2: ReceiverConfirmation Component**
```tsx
- Modal/Bottom sheet
- Delivery summary
- "Confirm Receipt" button
- "Report Issue" button
- Optional: photo upload
- Call POST /delivery/:id/confirm
```

**Step 4.3: Delivery Details Integration**
- Show ReceiverConfirmation if:
  - currentUser is recipient
  - status is 'picked_up'
  - not yet confirmed
- Show "Confirmed" badge if recipientConfirmed = true
- Update status display

**Step 4.4: Notifications**
- "Your delivery has been picked up" → receiver
- Click → /delivery-details/[id] with ReceiverConfirmation
- "Receiver confirmed delivery" → picker

### Phase 5: Frontend - Unified Chat (Day 3)

**Step 5.1: UnifiedChatTabs Component**
```tsx
<TabContainer>
  <TabBar>
    <Tab
      label="Sender"
      badge={senderUnreadCount}
      active={activeTab === 'sender'}
    />
    <Tab
      label="Receiver"
      badge={receiverUnreadCount}
      active={activeTab === 'receiver'}
    />
  </TabBar>

  <ChatView>
    {activeTab === 'sender' ? (
      <ChatMessages sessionId={senderSessionId} />
    ) : (
      <ChatMessages sessionId={receiverSessionId} />
    )}
  </ChatView>
</TabContainer>
```

**Step 5.2: Picker Chat Page**
- Create /chat/[deliveryId] or update existing
- Fetch GET `/chat/delivery/:deliveryId/unified`
- Integrate UnifiedChatTabs
- Handle tab switching
- Update unread badges on new messages

**Step 5.3: Chat Integration**
- Update chat service to fetch unified sessions
- Real-time updates for both tabs
- Badge updates on new messages

### Phase 6: Testing & Polish (Day 3)

**Step 6.1: E2E Flow Testing**
1. Sender creates delivery with receiver email
2. Receiver found → auto-populate
3. Delivery created with recipientId
4. Picker accepts delivery
5. Picker picks up → status 'picked_up'
6. Receiver gets notification
7. Receiver opens delivery → sees confirmation
8. Receiver confirms
9. Status → 'delivered'
10. Picker gets confirmation notification

**Step 6.2: Edge Cases**
- Receiver email not found → phone fallback
- Receiver rejects delivery → report issue flow
- No receiver (phone only) → skip confirmation?
- Picker sees unified chat correctly

**Step 6.3: UI/UX Polish**
- Loading states
- Error messages
- Success toasts
- Smooth animations
- Responsive design

---

## 🧪 Testing Checklist

### Backend Tests:

- [ ] POST /delivery/find-receiver with valid email
- [ ] POST /delivery/find-receiver with valid UID
- [ ] POST /delivery/find-receiver with invalid data
- [ ] POST /delivery/:id/confirm as receiver
- [ ] POST /delivery/:id/confirm as non-receiver (should fail)
- [ ] POST /delivery/:id/confirm wrong status (should fail)
- [ ] GET /delivery/incoming returns correct deliveries
- [ ] GET /chat/delivery/:id/unified returns both sessions
- [ ] Notifications sent correctly

### Frontend Tests:

- [ ] ReceiverInput finds user by email
- [ ] ReceiverInput finds user by UID
- [ ] ReceiverInput shows "not found"
- [ ] ReceiverInput phone fallback works
- [ ] Delivery creation with receiver email
- [ ] Incoming deliveries tab shows deliveries
- [ ] ReceiverConfirmation appears for receiver
- [ ] Confirm button updates status
- [ ] UnifiedChatTabs switches between sender/receiver
- [ ] Unread badges update correctly
- [ ] Notifications redirect correctly

---

## 📊 Database Schema Changes

**No migration needed!** All fields already exist:
- ✅ `deliveries.recipient_id` (integer, nullable)
- ✅ `deliveries.recipient_phone` (varchar, nullable)
- ✅ `deliveries.recipient_confirmed` (boolean, default false)
- ✅ `chat_sessions.recipient_id` (integer, nullable)

---

## 🔗 Dependencies

**Required for this task:**
- Existing auth system (Firebase)
- Notification system
- Chat system
- Delivery system

**No new dependencies needed!**

---

## 🚀 Deployment Notes

1. Deploy backend first (new endpoints)
2. Test endpoints manually
3. Deploy frontend
4. Monitor notifications
5. Check error logs

---

## 📝 Notes & Considerations

### Receiver Phone vs User:
- If receiver is registered user → use recipientId
- If receiver is guest → use recipientPhone
- Confirmation only works for registered users
- Phone-only receivers: auto-confirm? or skip?

### Unified Chat:
- Only for picker role
- Sender still has single chat (with picker)
- Receiver has single chat (with picker)
- Picker needs both in one view

### Status Flow:
```
pending → accepted → picked_up → [CONFIRMATION] → delivered
                                       ↓
                              recipientConfirmed = true
```

### Future Enhancements:
- Photo proof of delivery
- Signature capture
- Delivery rating by receiver
- Issue reporting with resolution flow

---

**Created by**: Claude Code
**Last Updated**: 2025-10-21

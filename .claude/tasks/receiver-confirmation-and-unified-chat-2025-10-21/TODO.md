# TODO Checklist

**Task**: Receiver Confirmation & Unified Chat
**Created**: 2025-10-21

---

## 🎯 Quick Checklist

### Backend (9 items)

#### Receiver Search
- [ ] Create `FindReceiverDto` class
- [ ] Add `findByEmailOrUid(emailOrUid: string)` method in `user.service.ts`
- [ ] Add POST `/delivery/find-receiver` endpoint in `delivery.controller.ts`
- [ ] Test receiver search with email
- [ ] Test receiver search with UID

#### Receiver Confirmation
- [ ] Create `ConfirmDeliveryDto` class
- [ ] Add `confirmDeliveryByReceiver(deliveryId, userId, dto)` method in `delivery.service.ts`
- [ ] Add validation: only recipient can confirm
- [ ] Add validation: status must be 'picked_up'
- [ ] Update status to 'delivered' and set `recipientConfirmed = true`
- [ ] Add POST `/delivery/:id/confirm` endpoint
- [ ] Test confirmation as receiver
- [ ] Test confirmation as non-receiver (should fail)

#### Incoming Deliveries
- [ ] Add GET `/delivery/incoming` endpoint
- [ ] Filter deliveries where `recipientId = currentUser.id`
- [ ] Include sender and picker info in response
- [ ] Test incoming deliveries retrieval

#### Notifications
- [ ] Add `notifyReceiverPickedUp(recipientUid, deliveryId, pickerName)` method
- [ ] Call notification when status changes to 'picked_up'
- [ ] Add `notifyPickerConfirmed(pickerUid, deliveryId, receiverName)` method
- [ ] Call notification when receiver confirms
- [ ] Update notification redirect: `/orders/[id]` → `/delivery-details/[id]`
- [ ] Test notification redirects

#### Unified Chat
- [ ] Add `getUnifiedSessionsForPicker(deliveryId, pickerId)` method in `chat.service.ts`
- [ ] Find sender session (where pickerId = user AND senderId = delivery.sender)
- [ ] Find receiver session (where pickerId = user AND recipientId = delivery.recipient)
- [ ] Return both sessions with unread counts
- [ ] Add GET `/chat/delivery/:deliveryId/unified` endpoint
- [ ] Test unified sessions retrieval

---

### Frontend (11 items)

#### ReceiverInput Component
- [ ] Create `components/ReceiverInput.tsx`
- [ ] Add email/UID input field with debounced search (300ms)
- [ ] Call `findReceiver(emailOrUid)` API
- [ ] Show user card if found (name, avatar, email)
- [ ] Show "Not found" message if null
- [ ] Add "Use phone number instead" fallback
- [ ] Add loading state
- [ ] Add error handling

#### ReceiverConfirmation Component
- [ ] Create `components/ReceiverConfirmation.tsx`
- [ ] Design bottom sheet modal
- [ ] Show delivery summary (from, to, items)
- [ ] Add "Confirm Receipt" button
- [ ] Add "Report Issue" button
- [ ] Call POST `/delivery/:id/confirm`
- [ ] Show success message
- [ ] Handle errors

#### UnifiedChatTabs Component
- [ ] Create `components/UnifiedChatTabs.tsx`
- [ ] Create tab bar with "Sender" and "Receiver" tabs
- [ ] Add unread badge on tabs
- [ ] Implement tab switching
- [ ] Load sender chat session
- [ ] Load receiver chat session
- [ ] Handle real-time message updates
- [ ] Update unread counts

#### Pages - package-type
- [ ] Update `app/package-type/page.tsx`
- [ ] Remove receiver `<select>` dropdown
- [ ] Add `<ReceiverInput />` component
- [ ] Handle receiver selection (user or phone)
- [ ] Update form submission with receiver data
- [ ] Test delivery creation with email
- [ ] Test delivery creation with UID
- [ ] Test delivery creation with phone fallback

#### Pages - delivery-methods
- [ ] Update `app/delivery-methods/page.tsx`
- [ ] Add "Incoming" tab (for receivers)
- [ ] Fetch GET `/delivery/incoming`
- [ ] Display incoming deliveries
- [ ] Show "Pending Confirmation" badge
- [ ] Make deliveries clickable → `/delivery-details/[id]`
- [ ] Test incoming deliveries tab

#### Pages - delivery-details
- [ ] Update `app/delivery-details/[id]/page.tsx`
- [ ] Check if currentUser is recipient
- [ ] Check if status is 'picked_up'
- [ ] Check if not yet confirmed
- [ ] Show `<ReceiverConfirmation />` modal
- [ ] Show "Confirmed ✓" badge if recipientConfirmed
- [ ] Update status display
- [ ] Test confirmation flow

#### Pages - Chat (Picker)
- [ ] Create or update picker chat page
- [ ] Fetch GET `/chat/delivery/:deliveryId/unified`
- [ ] Integrate `<UnifiedChatTabs />`
- [ ] Load both sender and receiver sessions
- [ ] Handle tab switching
- [ ] Test unified chat view

#### API Integration
- [ ] Create `findReceiver(emailOrUid)` in `api/user.ts`
- [ ] Create `confirmDelivery(deliveryId, dto)` in `api/delivery.ts`
- [ ] Create `getIncomingDeliveries()` in `api/delivery.ts`
- [ ] Create `getUnifiedChatSessions(deliveryId)` in `api/chat.ts`
- [ ] Update `CreateDeliveryRequest` interface
- [ ] Test all API integrations

---

### Testing (17 items)

#### Backend Tests
- [ ] Test POST /delivery/find-receiver with valid email
- [ ] Test POST /delivery/find-receiver with valid UID
- [ ] Test POST /delivery/find-receiver with invalid input
- [ ] Test POST /delivery/:id/confirm as receiver (success)
- [ ] Test POST /delivery/:id/confirm as non-receiver (fail)
- [ ] Test POST /delivery/:id/confirm with wrong status (fail)
- [ ] Test GET /delivery/incoming returns correct deliveries
- [ ] Test GET /chat/delivery/:id/unified returns both sessions
- [ ] Test notifications sent on pickup
- [ ] Test notifications sent on confirmation

#### Frontend Tests
- [ ] Test ReceiverInput finds user by email
- [ ] Test ReceiverInput finds user by UID
- [ ] Test ReceiverInput shows "not found"
- [ ] Test ReceiverInput phone fallback
- [ ] Test delivery creation with receiver email
- [ ] Test incoming deliveries tab
- [ ] Test ReceiverConfirmation modal
- [ ] Test confirm button updates status
- [ ] Test UnifiedChatTabs switches tabs
- [ ] Test unread badges update
- [ ] Test notification redirects

#### E2E Flow
- [ ] Create delivery with receiver email → found
- [ ] Picker accepts delivery
- [ ] Picker picks up → status 'picked_up'
- [ ] Receiver gets notification
- [ ] Receiver opens delivery → sees confirmation modal
- [ ] Receiver confirms
- [ ] Status changes to 'delivered'
- [ ] Picker gets confirmation notification
- [ ] Picker sees unified chat correctly

---

## 📊 Summary

- **Backend**: 36 tasks
- **Frontend**: 54 tasks
- **Testing**: 29 tasks
- **Total**: 119 tasks

---

**Last Updated**: 2025-10-21

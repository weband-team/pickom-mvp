# Task: Receiver/Recipient Functionality

**Task ID**: feature-2025-10-17-receiver-functionality
**Created**: 2025-10-17
**Status**: 🟡 In Progress

## 📋 Task Description

Add receiver/recipient functionality to the Pickom delivery system. Currently, there are only two parties: sender (who creates the delivery) and picker (who delivers). This task adds a third party - the receiver/recipient who receives the package at the destination address.

### Current State
- Sender creates delivery order
- Sender selects picker
- Delivery goes to an address, but the person at that address has no visibility into the delivery

### Desired State
- Sender can optionally specify a receiver during order creation
- Receiver can be specified by:
  - User ID (for MVP - no friend system needed)
  - Contact phone number (if receiver is not a platform user)
- Picker sees receiver information first, then sender information in order details
- **Display logic for receiver info**:
  - If `recipientId` specified → fetch user and show full card (avatar, name, rating, chat button)
  - If `recipientPhone` specified → show only phone number (no user lookup, call button only)
- Picker can chat with both sender and receiver (only if receiver has recipientId)
- Each delivery creates a new chat with two tabs for picker: Sender tab and Receiver tab

## 🎯 Goals & Success Criteria

- [ ] Add receiver selection UI during order creation (at package-type step)
- [ ] Support two types of receiver specification:
  - [ ] By user ID (registered user)
  - [ ] By contact phone number (non-registered user)
- [ ] Update order details page to show receiver information prominently
- [ ] **Implement conditional display**:
  - [ ] Full user card if recipientId exists
  - [ ] Phone number only if recipientPhone exists
- [ ] Extend chat system to support receiver as a third participant (only for recipientId)
- [ ] Implement tabbed chat UI for picker (Sender tab + Receiver tab)
- [ ] Ensure receiver gets notifications about delivery (only if recipientId)
- [ ] Test complete flow: sender creates order → picker accepts → picker chats with both sender and receiver

## 📁 Relevant Files

### Backend (Server)
- `pickom-server/src/delivery/entities/delivery.entity.ts` - ✅ Already has `recipientId` field (line 27-28)
- `pickom-server/src/delivery/dto/create-delivery.dto.ts` - ✅ Already has optional `recipientId` field (line 74-78)
- `pickom-server/src/delivery/dto/delivery.dto.ts` - ✅ Already has optional `recipientId` field (line 13-14)
- `pickom-server/src/delivery/delivery.service.ts` - May need updates for receiver handling
- `pickom-server/src/chat/entities/chat-session.entity.ts` - Current chat only supports senderId + pickerId
- `pickom-server/src/chat/chat.service.ts` - Chat logic restricted to sender-picker pairs (line 52-62)
- `pickom-server/src/notification/notification.service.ts` - May need receiver notifications

### Frontend (Client)
- `pickom-client/app/package-type/page.tsx` - Order creation form, needs receiver input
- `pickom-client/app/api/delivery.ts` - ✅ Already has `recipientId` in interfaces (line 20, 28)
- `pickom-client/app/orders/[id]/page.tsx` - Order details view, needs to show receiver
- `pickom-client/app/chat/[id]/page.tsx` - Chat page, needs tabbed UI for picker
- `pickom-client/app/chat/[id]/ChatPageClient.tsx` - Chat client implementation

## 🔍 Context & Research

### Existing Infrastructure

**Good news**: Much of the database infrastructure already exists!
- ✅ `delivery.recipientId` column already exists in entity
- ✅ `delivery.recipient` relation already configured (ManyToOne with User)
- ✅ DTOs already have optional recipientId field
- ✅ API interfaces already include recipientId

**What needs to be built**:
1. **UI for specifying receiver** during order creation
2. **Receiver contact info field** (phone number for non-users)
3. **Conditional display logic** in order details (user card vs phone number)
4. **Chat system extension** to include receiver as participant (only for recipientId)
5. **Tabbed chat UI** for picker to switch between sender and receiver
6. **Order details updates** to prominently display receiver

### Current Chat System Architecture

Chat sessions are currently binary:
```typescript
@Entity('chat_sessions')
export class ChatSession {
  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'picker_id' })
  pickerId: number;

  @Column({ name: 'delivery_id', nullable: true })
  deliveryId: number | null;
}
```

Chat creation logic enforces sender-picker relationship (chat.service.ts:52-62):
```typescript
if (currentUser.role === 'sender' && participant.role === 'picker') {
  senderId = currentUser.id;
  pickerId = participant.id;
} else if (currentUser.role === 'picker' && participant.role === 'sender') {
  senderId = participant.id;
  pickerId = currentUser.id;
} else {
  throw new BadRequestException(
    'Chat can only be created between sender and picker',
  );
}
```

**Challenge**: Need to extend this to support receiver without breaking existing chat system.

### Key Dependencies
- TypeORM (database entities and migrations)
- NestJS (backend services and controllers)
- Next.js 15 (frontend routing and pages)
- Material-UI (UI components)
- Firebase Authentication (user management)

### Related Components
- Delivery module (server)
- Chat module (server)
- Notification module (server)
- Order creation flow (client)
- Chat UI (client)
- Order details UI (client)

## 📝 Implementation Plan

### Phase 1: Backend - Receiver Contact Info
1. Add `recipientPhone` field to Delivery entity (for non-user receivers)
2. Create migration for new field
3. Update CreateDeliveryDto to include `recipientPhone` (optional)
4. Update DeliveryDto to include `recipientPhone` (optional)
5. Update delivery service to handle receiver logic
6. Add validation: either recipientId OR recipientPhone can be provided (not both)

### Phase 2: Backend - Chat System Extension
7. Add `recipientId` field to ChatSession entity (nullable)
8. Create migration for chat_sessions table update
9. Update chat service to support three participants (sender, picker, recipient)
10. Create separate chat sessions for picker-sender and picker-receiver
11. Update chat creation logic to handle receiver chats
12. Ensure existing sender-picker chats continue to work
13. **Important**: Chat with receiver only possible if recipientId exists (not recipientPhone)

### Phase 3: Backend - Notifications
14. Add notification logic for receiver when delivery is created (only if recipientId)
15. Add notification logic for receiver when picker accepts delivery (only if recipientId)
16. Add notification logic for receiver when delivery status changes (only if recipientId)

### Phase 4: Frontend - Order Creation UI
17. Add receiver section to package-type page
18. Add toggle: "Add receiver information"
19. Add two input options (radio buttons or tabs):
    - **Option A**: User ID input (for registered users)
    - **Option B**: Phone number input (for non-users)
20. Add validation:
    - Ensure only one option is filled
    - Validate phone number format
    - Validate user ID exists (optional client-side check)
21. Include receiver data in createDeliveryRequest API call

### Phase 5: Frontend - Order Details UI (Conditional Display)
22. Update orders/[id]/page.tsx to fetch and display receiver info
23. **Implement conditional rendering**:
    ```typescript
    if (order.recipientId && order.recipient) {
      // Show full user card:
      // - Avatar
      // - Name
      // - Rating
      // - "Contact Receiver" button (chat)
    } else if (order.recipientPhone) {
      // Show phone only:
      // - Phone icon
      // - Phone number
      // - "Call Receiver" button (tel: link)
    }
    ```
24. Show receiver section prominently (before sender info for picker role)
25. For sender role: show receiver info in order details as well

### Phase 6: Frontend - Chat UI Updates (Only for recipientId)
26. Create tabbed chat component for picker role
27. Add two tabs: "Sender" and "Receiver"
28. Fetch both chat sessions (picker-sender and picker-receiver)
29. Display appropriate chat based on active tab
30. Add unread message indicators on tabs
31. Ensure sender and receiver see single chat (no tabs)
32. **Important**: Only show receiver tab if order has recipientId (not recipientPhone)

### Phase 7: Testing & Integration
33. Test full flow: sender creates order with receiver (user ID)
34. Test full flow: sender creates order with receiver (phone number)
35. Test picker accepts order
36. Test picker can chat with sender and receiver (user ID case)
37. Test picker cannot chat with receiver (phone number case)
38. Test receiver receives notifications (user ID case)
39. Test conditional display in order details (both cases)
40. Test edge cases (receiver not found, invalid phone, etc.)
41. Test existing flows still work (orders without receiver)

## 🧪 Testing Instructions

### Manual Testing

#### As Sender:
- [ ] Create delivery order without receiver (should work as before)
- [ ] Create delivery order with receiver by user ID
  - [ ] Verify user card shown in order details
  - [ ] Verify receiver can chat with picker
- [ ] Create delivery order with receiver by phone number
  - [ ] Verify only phone number shown in order details
  - [ ] Verify NO chat option for receiver
- [ ] Try to specify both recipientId and recipientPhone (should fail validation)
- [ ] Verify order creation API call includes correct receiver data

#### As Picker:
- [ ] Accept delivery with receiver (user ID)
  - [ ] View order details - verify full user card shown
  - [ ] Verify "Contact Receiver" button appears
  - [ ] Open chat - verify two tabs (Sender/Receiver)
- [ ] Accept delivery with receiver (phone number)
  - [ ] View order details - verify only phone number shown
  - [ ] Verify "Call Receiver" button (or just phone display)
  - [ ] Open chat - verify NO receiver tab (only sender chat)
- [ ] Send message to sender
- [ ] Send message to receiver (user ID case only)
- [ ] Verify unread counts on tabs
- [ ] Verify notifications sent correctly

#### As Receiver (User ID case only):
- [ ] Receive notification when delivery created
- [ ] Receive notification when picker accepts
- [ ] View delivery details (if receiver has access)
- [ ] Chat with picker
- [ ] Receive delivery status updates

### Edge Cases:
- [ ] Invalid user ID for receiver
- [ ] User ID that doesn't exist
- [ ] Invalid phone number format
- [ ] Receiver and sender are same user
- [ ] Delivery without receiver specified
- [ ] Switching between deliveries with/without receivers
- [ ] Delivery with recipientPhone - verify no chat/notifications

### Automated Testing
- [ ] Unit tests for delivery service (receiver logic, validation)
- [ ] Unit tests for chat service (three-way chat, conditional logic)
- [ ] Integration tests for delivery creation with recipientId
- [ ] Integration tests for delivery creation with recipientPhone
- [ ] Integration tests for chat creation with receiver
- [ ] E2E tests for complete delivery flow with receiver (both types)

## 🔖 Checkpoints

[Checkpoints will be added here using /bookmark command]

## 📌 Notes

### Design Decisions
- **No friend system for MVP**: Use simple user ID input instead of friend selection
- **Phone number for non-users**: Allow delivery to people not on the platform
- **Separate chat sessions**: Picker-sender and picker-receiver are separate chats (simpler than group chat)
- **Tabs for picker only**: Sender and receiver see single chat interface
- **Receiver shown first**: Picker sees receiver info prominently in order details
- **Conditional display**: recipientId → full user card | recipientPhone → phone number only
- **Chat limitation**: Only receivers with recipientId can chat (phone-only receivers cannot)

### Receiver Display Logic Summary

| Scenario | Display in Order Details | Chat Available | Notifications |
|----------|-------------------------|----------------|---------------|
| `recipientId` exists | Full user card (avatar, name, rating) + "Contact Receiver" button | ✅ Yes (tabbed chat for picker) | ✅ Yes |
| `recipientPhone` exists | Phone number only + "Call" button/link | ❌ No | ❌ No |
| Neither specified | No receiver section | ❌ No | ❌ No |

### Future Enhancements (Out of Scope for MVP)
- Friend system / contacts list
- Receiver confirmation/acceptance of delivery
- Group chat (sender + picker + receiver all in one chat)
- Receiver rating of picker
- Receiver delivery instructions
- Real-time delivery tracking shared with receiver
- Allow chat for phone-only receivers (via SMS bridge or invitation)

### Database Schema Notes
- `delivery.recipientId` → Foreign key to users table (nullable)
- `delivery.recipientPhone` → VARCHAR(20) (nullable, new field)
- Constraint: recipientId and recipientPhone are mutually exclusive (one or neither, not both)
- `chat_sessions.recipientId` → Foreign key to users table (nullable, new field)
- Chat sessions are 1:1 (two participants only, not group)

### API Endpoints to Modify/Create
- `POST /delivery/requests` - Already supports recipientId, add recipientPhone
- `GET /delivery/requests/:id` - Include recipient relation in response (if recipientId)
- `POST /chat/create` - Support creating picker-receiver chat (only if recipientId)
- `GET /chat/sessions` - Return both sender and receiver chats for picker
- `GET /chat/sessions/:deliveryId` - Get chats for specific delivery

### Component Structure
```
package-type/
  └── ReceiverSelector.tsx (new component)
      ├── Radio/Toggle: User ID vs Phone
      ├── TextInput: User ID
      └── TextInput: Phone Number

orders/[id]/
  └── ReceiverCard.tsx (new component)
      ├── if recipientId: UserCard component
      └── if recipientPhone: PhoneDisplay component

chat/[id]/
  └── TabbedChat.tsx (new component for picker)
      ├── Tab: Sender
      └── Tab: Receiver (conditional)
```

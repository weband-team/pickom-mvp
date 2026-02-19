# useNavigationBadges Hook

Custom hook for managing navigation badge counts (unread chats, notifications, active orders).

## Features

- ✅ Auto-fetches unread counts from API
- ✅ Auto-refreshes every 30 seconds
- ✅ Refreshes on window focus
- ✅ Parallel API calls for better performance
- ✅ Error handling with fallback values
- ✅ Supports "99+" formatting for numbers > 99

## Usage

```tsx
import { useNavigationBadges } from '../../hooks/useNavigationBadges';
import BottomNavigation from '../../components/common/BottomNavigation';

function MyPage() {
  // Get badge counts
  const { unreadChats, unreadNotifications, activeOrders, isLoading, refresh } = useNavigationBadges();

  return (
    <div>
      {/* Your page content */}

      {/* Bottom Navigation with badges */}
      <BottomNavigation
        unreadChatsCount={unreadChats}
        unreadNotificationsCount={unreadNotifications}
        activeOrdersCount={activeOrders}
      />
    </div>
  );
}
```

## API

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `unreadChats` | `number` | Total count of unread messages across all chats |
| `unreadNotifications` | `number` | Count of unread notifications |
| `activeOrders` | `number` | Count of active orders (TODO: implement API) |
| `isLoading` | `boolean` | Loading state during initial fetch |
| `refresh` | `() => Promise<void>` | Manual refresh function |

### Badge Formatting

The `BottomNavigation` component automatically formats badge counts:
- Numbers 0-99: Display as-is
- Numbers > 99: Display as "99+"

## Example: Manual Refresh

```tsx
const { unreadChats, refresh } = useNavigationBadges();

const handleSendMessage = async () => {
  await sendMessage(chatId, message);
  // Manually refresh badge counts after sending
  await refresh();
};
```

## Dependencies

- `app/api/notifications.ts` - `getUnreadCount()`
- `app/api/chat.ts` - `getMyChats()`
- Material-UI Badge component

## Configuration

```typescript
const REFRESH_INTERVAL = 30000; // 30 seconds
```

Change this value in `useNavigationBadges.ts` to adjust auto-refresh frequency.

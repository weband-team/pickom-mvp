'use client';

import { useNotifications } from '../hooks/useNotifications';

interface NotificationBadgeProps {
  className?: string;
}

export default function NotificationBadge({ className = '' }: NotificationBadgeProps) {
  const { unreadCount, isLoading } = useNotifications();

  if (isLoading || unreadCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
    </div>
  );
}
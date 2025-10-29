'use client';

import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface NotificationItemProps {
  notification: {
    id: number;
    title: string;
    message: string;
    type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery' | 'new_delivery' | 'recipient_confirmed' | 'recipient_rejected';
    read: boolean;
    created_at: string;
  };
  onMarkAsRead: (id: number) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'offer_received': return '💼';
      case 'offer_accepted': return '✅';
      case 'status_update': return '📦';
      case 'incoming_delivery': return '📥';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'offer_received': return 'bg-blue-50 border-blue-200';
      case 'offer_accepted': return 'bg-green-50 border-green-200';
      case 'status_update': return 'bg-orange-50 border-orange-200';
      case 'incoming_delivery': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: enUS
  });

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        notification.read
          ? 'bg-white border-gray-200 opacity-75'
          : `${getTypeColor(notification.type)} shadow-sm`
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{getTypeIcon(notification.type)}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>

          <p className={`text-sm mb-2 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </p>

          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default function NotificationList() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Ошибка загрузки уведомлений</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Уведомлений пока нет
        </h3>
        <p className="text-gray-500">
          Здесь будут появляться уведомления о ваших заказах
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Уведомления
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Отметить все как прочитанные
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
}
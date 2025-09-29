'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI, type Notification } from '../api/notifications';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузить уведомления
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [notificationsData, unreadCountData] = await Promise.all([
        notificationsAPI.getUserNotifications(),
        notificationsAPI.getUnreadCount(),
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки уведомлений';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);

      // Обновляем локальное состояние
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Обновляем счетчик непрочитанных
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отметки уведомления';
      toast.error(errorMessage);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Отметить все уведомления как прочитанные
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();

      // Обновляем локальное состояние
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);

      toast.success('Все уведомления отмечены как прочитанные');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отметки уведомлений';
      toast.error(errorMessage);
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Получить непрочитанные уведомления
  const unreadNotifications = notifications.filter(n => !n.read);

  // Загрузить уведомления при монтировании компонента
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
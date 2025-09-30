'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  notificationsAPI,
  type Notification,
  type OfferReceivedRequest,
  type OfferAcceptedRequest,
  type IncomingDeliveryRequest,
  type StatusUpdateRequest,
  type CreateNotificationRequest
} from '../api/notifications';
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

  // === МЕТОДЫ ДЛЯ СОЗДАНИЯ УВЕДОМЛЕНИЙ ===

  // Создать уведомление о новом предложении
  const createOfferReceivedNotification = useCallback(async (data: OfferReceivedRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyOfferReceived(data);

      // Добавляем уведомление в локальное состояние, если оно для текущего пользователя
      // (в реальном приложении это будет обработано через WebSocket или Push-уведомления)
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Уведомление о предложении создано');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания уведомления';
      toast.error(errorMessage);
      console.error('Error creating offer received notification:', err);
      throw err;
    }
  }, []);

  // Создать уведомление о принятии предложения
  const createOfferAcceptedNotification = useCallback(async (data: OfferAcceptedRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyOfferAccepted(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Уведомление о принятии предложения создано');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания уведомления';
      toast.error(errorMessage);
      console.error('Error creating offer accepted notification:', err);
      throw err;
    }
  }, []);

  // Создать уведомление о входящей доставке
  const createIncomingDeliveryNotification = useCallback(async (data: IncomingDeliveryRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyIncomingDelivery(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Уведомление о входящей доставке создано');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания уведомления';
      toast.error(errorMessage);
      console.error('Error creating incoming delivery notification:', err);
      throw err;
    }
  }, []);

  // Создать уведомление об обновлении статуса
  const createStatusUpdateNotification = useCallback(async (data: StatusUpdateRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyStatusUpdate(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Уведомление об обновлении статуса создано');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания уведомления';
      toast.error(errorMessage);
      console.error('Error creating status update notification:', err);
      throw err;
    }
  }, []);

  // Общий метод для создания произвольного уведомления
  const createCustomNotification = useCallback(async (data: CreateNotificationRequest) => {
    try {
      const newNotification = await notificationsAPI.createNotification(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Уведомление создано');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания уведомления';
      toast.error(errorMessage);
      console.error('Error creating custom notification:', err);
      throw err;
    }
  }, []);

  // Получить непрочитанные уведомления
  const unreadNotifications = notifications.filter(n => !n.read);

  // Загрузить уведомления при монтировании компонента
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    // Базовые данные
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    error,

    // Методы чтения и управления
    fetchNotifications,
    markAsRead,
    markAllAsRead,

    // Методы создания уведомлений
    createOfferReceivedNotification,
    createOfferAcceptedNotification,
    createIncomingDeliveryNotification,
    createStatusUpdateNotification,
    createCustomNotification,
  };
};
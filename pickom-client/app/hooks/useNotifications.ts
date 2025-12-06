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

  // Load notifications
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread counter
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      toast.error(errorMessage);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);

      toast.success('All notifications marked as read');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      toast.error(errorMessage);
    }
  }, []);

  // === METHODS FOR CREATING NOTIFICATIONS ===

  // Create notification about new offer
  const createOfferReceivedNotification = useCallback(async (data: OfferReceivedRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyOfferReceived(data);

      // Add notification to local state if it's for the current user
      // (in a real application this would be handled via WebSocket or Push notifications)
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Offer notification created');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Create notification about offer acceptance
  const createOfferAcceptedNotification = useCallback(async (data: OfferAcceptedRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyOfferAccepted(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Offer accepted notification created');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Create notification about incoming delivery
  const createIncomingDeliveryNotification = useCallback(async (data: IncomingDeliveryRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyIncomingDelivery(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Incoming delivery notification created');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Create notification about status update
  const createStatusUpdateNotification = useCallback(async (data: StatusUpdateRequest) => {
    try {
      const newNotification = await notificationsAPI.notifyStatusUpdate(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Status update notification created');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // General method for creating custom notification
  const createCustomNotification = useCallback(async (data: CreateNotificationRequest) => {
    try {
      const newNotification = await notificationsAPI.createNotification(data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast.success('Notification created');
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Get unread notifications
  const unreadNotifications = notifications.filter(n => !n.read);

  // Load notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    // Basic data
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    error,

    // Read and management methods
    fetchNotifications,
    markAsRead,
    markAllAsRead,

    // Notification creation methods
    createOfferReceivedNotification,
    createOfferAcceptedNotification,
    createIncomingDeliveryNotification,
    createStatusUpdateNotification,
    createCustomNotification,
  };
};
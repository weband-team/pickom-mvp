import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../app/api/notifications';
import { getMyChats } from '../app/api/chat';

interface NavigationBadges {
  unreadChats: number;
  unreadNotifications: number;
  activeOrders: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Custom hook to manage navigation badge counts
 * Fetches unread chats, notifications, and active orders
 * Auto-refreshes every 30 seconds
 */
export function useNavigationBadges(): NavigationBadges {
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBadgeCounts = useCallback(async () => {
    try {
      // Fetch data in parallel for better performance
      const [chatsResponse, notificationsCount] = await Promise.all([
        getMyChats().catch(() => ({ data: [] })),
        notificationsAPI.getUnreadCount().catch(() => 0),
      ]);

      // Calculate total unread messages across all chats
      const totalUnreadChats = chatsResponse.data.reduce(
        (sum, chat) => sum + (chat.unreadCount || 0),
        0
      );

      setUnreadChats(totalUnreadChats);
      setUnreadNotifications(notificationsCount);

      // TODO: Implement active orders count when API is ready
      // For now, we can count chats with active deliveries
      setActiveOrders(0);
    } catch (error) {
      console.error('Failed to fetch navigation badge counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBadgeCounts();
  }, [fetchBadgeCounts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBadgeCounts, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBadgeCounts]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchBadgeCounts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchBadgeCounts]);

  return {
    unreadChats,
    unreadNotifications,
    activeOrders,
    isLoading,
    refresh: fetchBadgeCounts,
  };
}

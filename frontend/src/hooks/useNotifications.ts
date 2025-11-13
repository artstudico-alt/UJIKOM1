import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  event?: {
    id: number;
    title: string;
    date: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  recent: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (page = 1, perPage = 20, filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filters,
      });

      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.unread_count;
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/notifications/statistics');
      setStats(response.data.data);
      return response.data.data;
    } catch (err: any) {
      console.error('Error fetching notification stats:', err);
      return null;
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      // Update stats
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : null);
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [stats]);

  const markAsUnread = useCallback(async (id: number) => {
    try {
      await api.put(`/notifications/${id}/unread`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: false } : notif
        )
      );
      // Update stats
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: prev.unread + 1 } : null);
      }
    } catch (err: any) {
      console.error('Error marking notification as unread:', err);
      throw err;
    }
  }, [stats]);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      // Update stats
      if (stats) {
        const deletedNotification = notifications.find(n => n.id === id);
        if (deletedNotification && !deletedNotification.is_read) {
          setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1), total: prev.total - 1 } : null);
        } else {
          setStats(prev => prev ? { ...prev, total: prev.total - 1 } : null);
        }
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [stats, notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      // Update stats
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: 0 } : null);
      }
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [stats]);

  const refreshNotifications = useCallback(async (page = 1, filters = {}) => {
    try {
      const data = await fetchNotifications(page, 20, filters);
      setNotifications(data.data);
      return data;
    } catch (err) {
      console.error('Error refreshing notifications:', err);
      throw err;
    }
  }, [fetchNotifications]);

  const loadMoreNotifications = useCallback(async (page: number, filters = {}) => {
    try {
      const data = await fetchNotifications(page, 20, filters);
      setNotifications(prev => [...prev, ...data.data]);
      return data;
    } catch (err) {
      console.error('Error loading more notifications:', err);
      throw err;
    }
  }, [fetchNotifications]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchStats();
      } catch (err) {
        console.error('Error auto-refreshing notification stats:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    notifications,
    stats,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    fetchStats,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    refreshNotifications,
    loadMoreNotifications,
  };
};

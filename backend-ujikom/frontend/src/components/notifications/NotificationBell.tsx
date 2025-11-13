import React, { useState, useEffect } from 'react';
import { Notifications, NotificationsActive } from '@mui/icons-material';
import api from '../../services/api';

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

interface NotificationBellProps {
  onNotificationClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onNotificationClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        disabled={isLoading}
      >
        {unreadCount > 0 ? (
          <NotificationsActive className="h-6 w-6 text-blue-600" />
        ) : (
          <Notifications className="h-6 w-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;

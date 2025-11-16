import React, { useState, useEffect } from 'react';
import { IconButton, Badge } from '@mui/material';
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
    <IconButton 
      color="inherit" 
      onClick={handleClick}
      disabled={isLoading}
      title={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Notifikasi'}
    >
      <Badge 
        badgeContent={unreadCount > 99 ? '99+' : unreadCount} 
        color="error"
        invisible={unreadCount === 0}
      >
        {unreadCount > 0 ? (
          <NotificationsActive sx={{ color: '#4f46e5' }} />
        ) : (
          <Notifications />
        )}
      </Badge>
    </IconButton>
  );
};

export default NotificationBell;

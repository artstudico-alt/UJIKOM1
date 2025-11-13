import React, { useState, useEffect } from 'react';
import { Close, Check, CheckCircle, Delete, Event, Schedule, People, EmojiEvents, Notifications as NotificationsIcon } from '@mui/icons-material';
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

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationUpdate?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  isOpen, 
  onClose, 
  onNotificationUpdate 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (page = 1, reset = false) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/notifications?page=${page}&per_page=10`);
      const newNotifications = response.data.data.data;
      
      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      setHasMore(response.data.data.current_page < response.data.data.last_page);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, true);
    }
  }, [isOpen]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/unread`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: false } : notif
        )
      );
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_event':
        return <Event sx={{ fontSize: 20, color: 'green' }} />;
      case 'event_reminder':
        return <Schedule sx={{ fontSize: 20, color: 'orange' }} />;
      case 'attendance_started':
        return <People sx={{ fontSize: 20, color: 'blue' }} />;
      case 'event_completed':
        return <EmojiEvents sx={{ fontSize: 20, color: 'purple' }} />;
      case 'certificate_generated':
        return <EmojiEvents sx={{ fontSize: 20, color: 'gold' }} />;
      case 'event_registration':
        return <CheckCircle sx={{ fontSize: 20, color: 'green' }} />;
      case 'registration_deadline':
        return <Schedule sx={{ fontSize: 20, color: 'red' }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 20, color: 'gray' }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_event':
        return 'border-l-green-500 bg-green-50';
      case 'event_reminder':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'attendance_started':
        return 'border-l-blue-500 bg-blue-50';
      case 'event_completed':
        return 'border-l-purple-500 bg-purple-50';
      case 'certificate_generated':
        return 'border-l-yellow-400 bg-yellow-50';
      case 'event_registration':
        return 'border-l-green-400 bg-green-50';
      case 'registration_deadline':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} hari yang lalu`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative ml-auto w-full max-w-md h-full bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Notifikasi</h2>
          <div className="flex items-center space-x-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Tandai semua dibaca
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <NotificationsIcon sx={{ fontSize: 48, color: 'gray', mb: 2 }} />
              <p>Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {!notification.is_read ? (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Tandai sebagai dibaca"
                            >
                              <Check className="h-4 w-4 text-gray-500" />
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsUnread(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Tandai sebagai belum dibaca"
                            >
                              <CheckCircle className="h-4 w-4 text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Hapus notifikasi"
                          >
                            <Delete className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {isLoading ? 'Memuat...' : 'Muat lebih banyak'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationList;

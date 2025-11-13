import React, { useState, useEffect } from 'react';
import { Notifications as NotificationsIcon, FilterList, Search, Check, CheckCircle, Delete } from '@mui/icons-material';
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

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotifications = async (page = 1, reset = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });

      if (filter !== 'all') {
        params.append('is_read', filter === 'read' ? '1' : '0');
      }

      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await api.get(`/notifications?${params.toString()}`);
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

  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/statistics');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  useEffect(() => {
    fetchNotifications(1, true);
    fetchStats();
  }, [filter, typeFilter]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      fetchStats();
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
      fetchStats();
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      fetchStats();
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
      fetchStats();
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
        return <NotificationsIcon sx={{ fontSize: 20, color: 'green' }} />;
      case 'event_reminder':
        return <NotificationsIcon sx={{ fontSize: 20, color: 'orange' }} />;
      case 'attendance_started':
        return <NotificationsIcon sx={{ fontSize: 20, color: 'blue' }} />;
      case 'event_completed':
        return <NotificationsIcon sx={{ fontSize: 20, color: 'purple' }} />;
      case 'certificate_generated':
        return <NotificationsIcon sx={{ fontSize: 20, color: 'gold' }} />;
      case 'event_registration':
        return <NotificationsIcon sx={{ fontSize: 20, color: 'green' }} />;
      case 'registration_deadline':
        return <NotificationsIcon sx={{ fontSize: 20, color: 'red' }} />;
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
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm) {
      return notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
                <p className="text-gray-600 mt-1">Kelola notifikasi Anda</p>
              </div>
              {stats && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Total: {stats.total}</span>
                  <span className="text-red-600">Belum dibaca: {stats.unread}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <FilterList className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">Semua</option>
                  <option value="unread">Belum dibaca</option>
                  <option value="read">Sudah dibaca</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">Semua tipe</option>
                  <option value="new_event">Event Baru</option>
                  <option value="event_registration">Pendaftaran Berhasil</option>
                  <option value="event_reminder">Pengingat Event</option>
                  <option value="registration_deadline">Batas Pendaftaran</option>
                  <option value="attendance_started">Daftar Hadir</option>
                  <option value="event_completed">Event Selesai</option>
                  <option value="certificate_generated">Sertifikat Dibuat</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm flex-1"
                />
              </div>

              {stats && stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Notifications List */}
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <NotificationsIcon sx={{ fontSize: 48, color: 'gray', mb: 2 }} />
                <p>Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50'
                    } rounded-lg`}
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
                          <div className="flex items-center space-x-2">
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
                  <div className="text-center pt-4">
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
    </div>
  );
};

export default Notifications;

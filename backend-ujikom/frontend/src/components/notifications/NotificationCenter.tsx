import React, { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import NotificationList from './NotificationList';

const NotificationCenter: React.FC = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNotificationClick = () => {
    setIsNotificationOpen(true);
  };

  const handleNotificationUpdate = () => {
    // This will be called when notifications are updated
    // The parent component can use this to refresh the unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClose = () => {
    setIsNotificationOpen(false);
  };

  return (
    <>
      <NotificationBell onNotificationClick={handleNotificationClick} />
      <NotificationList
        isOpen={isNotificationOpen}
        onClose={handleClose}
        onNotificationUpdate={handleNotificationUpdate}
      />
    </>
  );
};

export default NotificationCenter;

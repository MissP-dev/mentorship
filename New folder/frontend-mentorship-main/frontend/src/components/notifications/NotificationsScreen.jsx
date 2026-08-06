import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAsRead } from '../../services/notifications';
import TopBar from '../shared/TopBar';
import NotificationItem from '../shared/NotificationItem';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications(user.id).then(setNotifications);
  }, [user.id]);

  const handleClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
    switch (notification.type) {
      case 'mentorship_request':
      case 'session_reminder':
        navigate('/dashboard');
        break;
      case 'new_comment':
        navigate('/feed');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Notifications" showBack />
      <main className="max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12 text-sm">No notifications yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onClick={handleClick} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

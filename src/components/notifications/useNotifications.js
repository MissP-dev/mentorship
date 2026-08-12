import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { resolveNotificationPath } from '../../services/notifications';

export default function useNotifications() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCheckRef = useRef(Date.now());
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const fetchNotifications = async () => {
      try {
        const notifications = await api('/notifications');
        const newOnes = notifications.filter(
          (n) => !seenIdsRef.current.has(n.id) && new Date(n.createdAt).getTime() > lastCheckRef.current
        );
        const unread = notifications.filter((n) => !n.read);

        setUnreadCount(unread.length);

        newOnes.forEach((n) => {
          seenIdsRef.current.add(n.id);
          showBrowserNotification(n);
          addToast(n);
        });

        lastCheckRef.current = Date.now();
      } catch {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const showBrowserNotification = (n) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = 'MConnect';
      const body = n.message;
      const notif = new Notification(title, { body, icon: '/favicon.svg' });
      notif.onclick = () => {
        window.focus();
        window.location.href = resolveNotificationPath(n);
      };
    }
  };

  const addToast = useCallback((n) => {
    const id = n.id + '-' + Date.now();
    setToasts((prev) => [...prev, { ...n, toastId: id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.toastId !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  return { toasts, unreadCount, dismissToast, setUnreadCount };
}

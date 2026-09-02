import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent — bell just stays empty
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-lg">✉</span>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-wine" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10">
            <span className="font-medium text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-wine hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted px-4 py-6 text-center">Nothing yet — critiques and comments will show up here.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n._id}
                to={n.link || '#'}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm border-b border-ink/5 hover:bg-ink/5 ${!n.read ? 'bg-gold/5' : ''}`}
              >
                {n.message}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

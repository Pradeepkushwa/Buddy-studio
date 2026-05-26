import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TYPE_ICONS = {
  new_booking: '📅',
  new_appointment: '📋',
  booking_updated: '✅',
  new_review: '⭐',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/admin/notifications')
      .then(r => {
        setNotifications(r.data.notifications);
        setUnreadCount(r.data.unread_count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      api.patch(`/admin/notifications/${notification.id}/read`)
        .then(r => setUnreadCount(r.data.unread_count))
        .catch(() => {});
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = () => {
    api.patch('/admin/notifications/mark_all_read')
      .then(() => {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      })
      .catch(() => {});
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={handleOpen} title="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span className="notification-dropdown-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="notification-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && notifications.length === 0 && (
              <div className="notification-empty">Loading...</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="notification-empty">No notifications yet</div>
            )}
            {notifications.map(n => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'notification-unread' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <span className="notification-icon">{TYPE_ICONS[n.notification_type] || '🔔'}</span>
                <div className="notification-body">
                  <div className="notification-item-title">{n.title}</div>
                  <div className="notification-item-message">{n.message}</div>
                  <div className="notification-item-time">{timeAgo(n.created_at)}</div>
                </div>
                {!n.read && <span className="notification-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

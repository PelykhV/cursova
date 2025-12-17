import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function MyNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      const res = await api.get('/me/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error loading notifications', err);
      setError('Не вдалося завантажити повідомлення');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/me/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  if (loading) return <div className="public-content">Завантаження...</div>;
  if (error) return <div className="public-content" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="public-content">
      <div className="profile-card">
        <h1 className="profile-title">Мої повідомлення</h1>

        {notifications.length === 0 ? (
          <p>Повідомлень немає.</p>
        ) : (
          <ul className="notif-list">
            {notifications.map(n => (
              <li
                key={n.id}
                className={`notif-item ${n.is_read ? 'notif-item-read' : ''}`}
              >
                <p><strong>Тип:</strong> {n.type}</p>
                <p>{n.message}</p>
                <p className="notif-date">
                  {new Date(n.created_at).toLocaleString()}
                </p>
                {!n.is_read && (
                  <button
                    className="btn-primary"
                    onClick={() => markAsRead(n.id)}
                  >
                    Позначити прочитаним
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="profile-back" style={{ marginTop: 16 }}>
          <Link to="/me">← Назад у кабінет</Link>
        </div>
      </div>
    </div>
  );
}

export default MyNotificationsPage;

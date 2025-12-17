import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/me');
        setProfile(res.data);
      } catch (err) {
        console.error('Error loading profile', err);
        setError('Не вдалося завантажити профіль');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) return <div className="public-content">Завантаження...</div>;
  if (error) return <div className="public-content" style={{ color: 'red' }}>{error}</div>;
  if (!profile) return null;

  return (
    <div className="public-content">
      <div className="profile-card">
        <h1 className="profile-title">Мій кабінет</h1>

        <section className="profile-section">
          <h2>Основна інформація</h2>
          <p><strong>Імʼя:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Роль:</strong> {profile.role}</p>
        </section>

        <section className="profile-section">
          <h2>Картка клієнта</h2>
          <p><strong>Тип картки:</strong> {profile.cardType || 'нема'}</p>
          <p><strong>Бонуси:</strong> {profile.bonusBalance ?? 0}</p>
          <p><strong>Знижка:</strong> {profile.discountPercent ?? 0}%</p>
          <p><strong>Безкоштовна доставка:</strong> {profile.freeDelivery ? 'так' : 'ні'}</p>
        </section>

        <section className="profile-section">
          <h2>Мої розділи</h2>
          <ul className="profile-links">
            <li>
              <Link to="/me/orders">Мої замовлення</Link>
            </li>
            <li>
              <Link to="/me/notifications">Мої повідомлення</Link>
            </li>
          </ul>
        </section>

        <div className="profile-back">
          <Link to="/">← Назад до каталогу</Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

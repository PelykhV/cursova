import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/public.css';

function PublicLayout({ children }) {
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const navigate = useNavigate();

  const isAdmin = role === 'ADMIN';
  const isLoggedIn = !!localStorage.getItem('token');

  // щоб оновлювалось після логіну/логауту без перезавантаження
  useEffect(() => {
    const handleStorage = () => {
      setRole(localStorage.getItem('role') || '');
      setUserName(localStorage.getItem('userName') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setRole('');
    setUserName('');
    navigate('/login');
  };

  return (
    <div className="public-shell">
      <header className="public-topbar">
        <div className="public-logo">
          Flower<span>Room</span>
        </div>

        <nav className="public-nav">
          <Link to="/">Каталог</Link>
          <Link to="/me/orders">Мої замовлення</Link>
        </nav>

        <div className="public-actions">
          {isLoggedIn ? (
            <>
              <span className="public-user">
                {userName || 'Користувач'}
              </span>
              <Link to="/me" className="public-link">Профіль</Link>

              {isAdmin && (
                <>
                  <Link to="/admin/bouquets" className="public-link">Адмін: букети</Link>
                  <Link to="/admin/orders" className="public-link">Адмін: замовлення</Link>
                  <Link to="/admin/customers" className="public-link">Адмін: клієнти</Link>
                  <Link to="/admin/options" className="public-link">Адмін: опції</Link>
                </>
              )}

              <button className="public-logout" onClick={handleLogout}>
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="public-link">Увійти</Link>
              <Link to="/register" className="public-link">Реєстрація</Link>
            </>
          )}
        </div>
      </header>

      <main className="public-main">
        <div className="public-content">{children}</div>
      </main>
    </div>
  );
}

export default PublicLayout;

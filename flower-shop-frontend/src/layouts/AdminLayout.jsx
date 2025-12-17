import { Link } from 'react-router-dom';
import '../styles/admin.css';

function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-logo">FLOWER.ADMIN</div>
        <nav className="admin-top-links">
          <Link to="/">Магазин</Link>   {/* ← повернення на головну */}
          <Link to="/admin/bouquets">Букети</Link>
          <Link to="/admin/orders">Замовлення</Link>
          <Link to="/admin/customers">Клієнти</Link>
          <Link to="/admin/options">Опції</Link>
        </nav>
      </header>
      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;

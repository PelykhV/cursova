import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get('/me/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Error loading orders', err);
        setError('Не вдалося завантажити замовлення');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) return <div className="public-content">Завантаження...</div>;
  if (error) return <div className="public-content" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="public-content">
      <div className="profile-card">
        <h1 className="profile-title">Мої замовлення</h1>

        {orders.length === 0 ? (
          <p>У вас ще немає замовлень.</p>
        ) : (
          <div className="public-table-wrapper">
            <table className="public-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Салон</th>
                  <th>Статус</th>
                  <th>Сума</th>
                  <th>Сума зі знижкою</th>
                  <th>Створено</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.salon_id}</td>
                    <td>{o.status}</td>
                    <td>{o.total_price}</td>
                    <td>{o.final_price}</td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="profile-back" style={{ marginTop: 16 }}>
          <Link to="/me">← Назад у кабінет</Link>
        </div>
      </div>
    </div>
  );
}

export default MyOrdersPage;

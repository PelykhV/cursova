import { useEffect, useState } from 'react';
import api from '../api/client';

const STATUSES = ['NEW', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'];

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/orders', { params });
      setOrders(res.data);
    } catch (err) {
      console.error('Error loading orders', err);
      setError('Не вдалося завантажити замовлення');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const updateLocal = (id, changes) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, ...changes } : o))
    );
  };

  const saveStatus = async (id) => {
    const order = orders.find(o => o.id === id);
    try {
      await api.patch(`/admin/orders/${id}/status`, {
        status: order.status,
      });
      alert('Статус оновлено');
    } catch (err) {
      console.error('Error updating status', err);
      alert('Помилка оновлення статусу');
    }
  };

  if (loading) return <div className="admin-content">Завантаження...</div>;
  if (error) return <div className="admin-content" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="admin-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-title">Замовлення</div>
          <div className="admin-subtitle">
            Перегляд та керування статусами замовлень
          </div>
        </div>

        {/* фільтр за статусом */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>Фільтр за статусом:</span>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Всі</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* таблиця замовлень */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Клієнт</th>
                <th>Салон</th>
                <th>Статус</th>
                <th>Сума</th>
                <th>Сума зі знижкою</th>
                <th>Створено</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.client_name}</td>
                  <td>{o.salon_name}</td>
                  <td>
                    <select
                      className="admin-select"
                      value={o.status}
                      onChange={e => updateLocal(o.id, { status: e.target.value })}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>{Number(o.total_price).toFixed(2)}</td>
                  <td>{Number(o.final_price).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => saveStatus(o.id)}
                    >
                      Зберегти
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOrdersPage;

import { useEffect, useState } from 'react';
import api from '../api/client';

const CARD_TYPES = ['NONE', 'SILVER', 'GOLD'];

function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error loading customers', err);
      setError('Не вдалося завантажити клієнтів');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const updateLocal = (id, changes) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...changes } : c))
    );
  };

  const saveCard = async (id) => {
    const customer = customers.find(c => c.id === id);
    try {
      await api.patch(`/admin/customers/${id}/card`, {
        cardType: customer.cardType || 'NONE',
      });
      alert('Картку оновлено');
    } catch (err) {
      console.error('Error saving card', err);
      alert('Помилка збереження картки');
    }
  };

  if (loading) return <div className="admin-content">Завантаження...</div>;
  if (error) return <div className="admin-content" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="admin-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-title">Клієнти та картки</div>
          <div className="admin-subtitle">
            Керуйте рівнями клієнтських карток, знижками та доставкою
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Імʼя</th>
                <th>Email</th>
                <th>Тип картки</th>
                <th>Знижка, %</th>
                <th>Безкоштовна доставка</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>
                    <select
                      className="admin-select"
                      value={c.cardType || 'NONE'}
                      onChange={e => updateLocal(c.id, { cardType: e.target.value })}
                    >
                      <option value="NONE">Звичайна</option>
                      <option value="SILVER">SILVER</option>
                      <option value="GOLD">GOLD</option>
                    </select>
                  </td>
                  <td>{c.discountPercent ?? 0}</td>
                  <td>
                    <span className={c.freeDelivery ? 'badge-yes' : 'badge-no'}>
                      {c.freeDelivery ? 'так' : 'ні'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => saveCard(c.id)}
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

export default AdminCustomersPage;

import { useEffect, useState } from 'react';
import api from '../api/client';

const TYPES = ['PACKAGING', 'DELIVERY', 'EXTRA'];

function AdminOptionsPage() {
  const [options, setOptions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOptions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/admin/options', { params });
      setOptions(res.data);
    } catch (err) {
      console.error('Error loading options', err);
      setError('Не вдалося завантажити опції');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, [typeFilter]);

  const updateLocal = (id, changes) => {
    setOptions(prev =>
      prev.map(o => (o.id === id ? { ...o, ...changes } : o))
    );
  };

  const saveOption = async (id) => {
    const o = options.find(x => x.id === id);
    try {
      await api.patch(`/admin/options/${id}`, {
        name: o.name,
        type: o.type,
        price: Number(o.price),
      });
      alert('Опцію оновлено');
    } catch (err) {
      console.error('Error updating option', err);
      alert('Помилка оновлення опції');
    }
  };

  if (loading) return <div className="admin-content">Завантаження...</div>;
  if (error) return <div className="admin-content" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="admin-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-title">Опції</div>
          <div className="admin-subtitle">
            Параметри упаковки, доставки та додаткових послуг
          </div>
        </div>

        {/* фільтр по типу */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>Фільтр за типом:</span>
          <select
            className="admin-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Всі</option>
            {TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* таблиця опцій */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                <th>Тип</th>
                <th>Ціна</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {options.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>
                    <input
                      className="admin-input"
                      type="text"
                      value={o.name}
                      onChange={e => updateLocal(o.id, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      value={o.type}
                      onChange={e => updateLocal(o.id, { type: e.target.value })}
                    >
                      {TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      type="number"
                      value={o.price}
                      onChange={e => updateLocal(o.id, { price: e.target.value })}
                      style={{ width: 90 }}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => saveOption(o.id)}
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

export default AdminOptionsPage;

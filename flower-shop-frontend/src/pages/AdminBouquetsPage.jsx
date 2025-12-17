import { useEffect, useState } from 'react';
import api from '../api/client';

const EVENTS = ['WEDDING', 'BIRTHDAY', 'VALENTINE', 'FUNERAL', 'OTHER'];
const emptyNew = { name: '', description: '', event_type: 'OTHER', base_price: 0 };

function AdminBouquetsPage() {
  const [bouquets, setBouquets] = useState([]);
  const [newBouquet, setNewBouquet] = useState(emptyNew);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBouquets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bouquets');
      setBouquets(res.data);
    } catch (err) {
      console.error('Error loading bouquets', err);
      setError('Не вдалося завантажити букети');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBouquets();
  }, []);

  const updateLocal = (id, changes) => {
    setBouquets(prev =>
      prev.map(b => (b.id === id ? { ...b, ...changes } : b))
    );
  };

  const saveBouquet = async (id) => {
    const b = bouquets.find(x => x.id === id);
    try {
      await api.patch(`/admin/bouquets/${id}`, {
        name: b.name,
        description: b.description,
        event_type: b.event_type,
        base_price: Number(b.base_price),
      });
      alert('Букет оновлено');
    } catch (err) {
      console.error('Error updating bouquet', err);
      alert('Помилка оновлення букета');
    }
  };

  const createBouquet = async () => {
    try {
      const res = await api.post('/admin/bouquets', {
        name: newBouquet.name,
        description: newBouquet.description,
        event_type: newBouquet.event_type,
        base_price: Number(newBouquet.base_price),
      });
      setBouquets(prev => [...prev, { id: res.data.id, ...newBouquet }]);
      setNewBouquet(emptyNew);
      alert('Букет створено');
    } catch (err) {
      console.error('Error creating bouquet', err);
      alert('Помилка створення букета');
    }
  };

  const deleteBouquet = async (id) => {
    if (!window.confirm(`Видалити букет #${id}?`)) return;
    try {
      await api.delete(`/admin/bouquets/${id}`);
      setBouquets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting bouquet', err);
      alert('Помилка видалення букета');
    }
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="admin-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-title">Букети</div>
          <div className="admin-subtitle">
            Створення та редагування позицій у каталозі
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
            Створити новий букет
          </div>
          <div className="admin-row">
            <input
              className="admin-input"
              type="text"
              placeholder="Назва"
              value={newBouquet.name}
              onChange={e => setNewBouquet({ ...newBouquet, name: e.target.value })}
            />
            <input
              className="admin-input"
              type="text"
              placeholder="Опис"
              value={newBouquet.description}
              onChange={e => setNewBouquet({ ...newBouquet, description: e.target.value })}
            />
            <select
              className="admin-select"
              value={newBouquet.event_type}
              onChange={e => setNewBouquet({ ...newBouquet, event_type: e.target.value })}
            >
              {EVENTS.map(ev => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
            <input
              className="admin-input"
              type="number"
              placeholder="Ціна"
              value={newBouquet.base_price}
              onChange={e => setNewBouquet({ ...newBouquet, base_price: e.target.value })}
              style={{ width: 110 }}
            />
            <button className="btn-primary" onClick={createBouquet}>
              Додати букет
            </button>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                <th>Опис</th>
                <th>Подія</th>
                <th>Ціна</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {bouquets.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>
                    <input
                      className="admin-input"
                      type="text"
                      value={b.name}
                      onChange={e => updateLocal(b.id, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      type="text"
                      value={b.description || ''}
                      onChange={e => updateLocal(b.id, { description: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      value={b.event_type || ''}
                      onChange={e => updateLocal(b.id, { event_type: e.target.value })}
                    >
                      {EVENTS.map(ev => (
                        <option key={ev} value={ev}>{ev}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      type="number"
                      value={b.base_price}
                      onChange={e => updateLocal(b.id, { base_price: e.target.value })}
                      style={{ width: 110 }}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ marginRight: 6 }}
                      onClick={() => saveBouquet(b.id)}
                    >
                      Зберегти
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => deleteBouquet(b.id)}
                    >
                      Видалити
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

export default AdminBouquetsPage;

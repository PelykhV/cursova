import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/client';

function App() {
  const [bouquets, setBouquets] = useState([]);
  const [eventFilter, setEventFilter] = useState('');
  const [userName] = useState(localStorage.getItem('userName') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBouquets = async () => {
      try {
        const params = {};
        if (eventFilter) params.event = eventFilter;
        const res = await api.get('/bouquets', { params });
        setBouquets(res.data);
      } catch (err) {
        console.error('Error fetching bouquets', err);
      }
    };

    fetchBouquets();
  }, [eventFilter]);

  const handleOrderClick = (id) => {
    navigate(`/order?bouquetId=${id}`);
  };

  return (
    <div className="public-content">
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Каталог букетів</h1>
          {userName && (
            <div className="catalog-subtitle">
              Ви увійшли як {userName}
            </div>
          )}
        </div>

        <div className="catalog-filter">
          <label>
            <span>Фільтр за подією:</span>
            <select
              className="order-input"
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
            >
              <option value="">Всі</option>
              <option value="WEDDING">Весілля</option>
              <option value="BIRTHDAY">День народження</option>
              <option value="VALENTINE">День Валентина</option>
              <option value="FUNERAL">Похорони</option>
            </select>
          </label>
        </div>
      </div>

      <div className="catalog-grid">
        {bouquets.map(b => (
          <div key={b.id} className="bouquet-card">
            <h3 className="bouquet-title">{b.name}</h3>
            <p className="bouquet-meta">Подія: {b.event_type}</p>
            <p className="bouquet-price">{b.base_price} грн</p>
            <button
              className="btn-primary"
              onClick={() => handleOrderClick(b.id)}
            >
              Замовити
            </button>
          </div>
        ))}
        {bouquets.length === 0 && (
          <p style={{ marginTop: 16 }}>Немає букетів за вибраним фільтром.</p>
        )}
      </div>
    </div>
  );
}

export default App;

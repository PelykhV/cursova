import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';

function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const bouquetId = searchParams.get('bouquetId');

  const [salons, setSalons] = useState([]);
  const [optionsPackaging, setOptionsPackaging] = useState([]);
  const [optionsDelivery, setOptionsDelivery] = useState([]);
  const [optionsExtra, setOptionsExtra] = useState([]);

  const [salonId, setSalonId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [packagingId, setPackagingId] = useState('');
  const [deliveryId, setDeliveryId] = useState('');
  const [extraIds, setExtraIds] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salonsRes, packRes, delRes, extraRes] = await Promise.all([
          api.get('/salons'),
          api.get('/options', { params: { type: 'PACKAGING' } }),
          api.get('/options', { params: { type: 'DELIVERY' } }),
          api.get('/options', { params: { type: 'EXTRA' } }),
        ]);
        setSalons(salonsRes.data);
        setOptionsPackaging(packRes.data);
        setOptionsDelivery(delRes.data);
        setOptionsExtra(extraRes.data);
      } catch (err) {
        console.error('Error loading order data', err);
        setError('Не вдалося завантажити дані для замовлення');
      }
    };
    loadData();
  }, []);

  const handleExtraChange = (id) => {
    setExtraIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const body = {
        salon_id: Number(salonId),
        event_date: null,
        payment_method: 'CARD',
        bouquets: [
          { bouquet_id: Number(bouquetId), quantity: Number(quantity) },
        ],
        packaging_option_id: packagingId ? Number(packagingId) : null,
        delivery_option_id: deliveryId ? Number(deliveryId) : null,
        extra_option_ids: extraIds,
      };

      const res = await api.post('/me/orders', body);
      setMessage(`Замовлення створено. ID: ${res.data.order_id}`);
      // за бажанням:
      // navigate('/me/orders');
    } catch (err) {
      console.error('Create order error', err);
      setError('Не вдалося створити замовлення (можливо, ви не увійшли в систему)');
    }
  };

  const zeroPackaging = (optionsPackaging || []).find(o => Number(o.price) === 0);
  const paidPackaging = (optionsPackaging || []).filter(o => Number(o.price) > 0);
  const zeroDelivery = (optionsDelivery || []).find(o => Number(o.price) === 0);
  const paidDelivery = (optionsDelivery || []).filter(o => Number(o.price) > 0);

  if (!bouquetId) {
    return <div className="public-content">Немає вибраного букета.</div>;
  }

  return (
    <div className="public-content">
      <div className="profile-card">
        <h1 className="profile-title">Оформлення замовлення</h1>
        <p style={{ marginBottom: 16 }}>Букет ID: {bouquetId}</p>

        <form className="order-form" onSubmit={handleSubmit}>
          <div className="order-field">
            <label>Салон</label>
            <select
              className="order-input"
              value={salonId}
              onChange={e => setSalonId(e.target.value)}
            >
              <option value="">Оберіть салон</option>
              {salons.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="order-field">
            <label>Кількість</label>
            <input
              className="order-input"
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>

          <div className="order-field">
            <label>Упаковка</label>
            <select
              className="order-input"
              value={packagingId}
              onChange={e => setPackagingId(e.target.value)}
            >
              <option value="">
                {zeroPackaging ? zeroPackaging.name : 'Без упаковки'}
              </option>
              {paidPackaging.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} (+{Number(o.price).toFixed(2)} грн)
                </option>
              ))}
            </select>
          </div>

          <div className="order-field">
            <label>Доставка</label>
            <select
              className="order-input"
              value={deliveryId}
              onChange={e => setDeliveryId(e.target.value)}
            >
              <option value="">
                {zeroDelivery ? zeroDelivery.name : 'Без доставки'}
              </option>
              {paidDelivery.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} (+{Number(o.price).toFixed(2)} грн)
                </option>
              ))}
            </select>
          </div>

          <div className="order-field">
            <label>Додаткові опції</label>
            <div className="order-extra-list">
              {optionsExtra.map(o => (
                <label key={o.id} className="order-extra-item">
                  <input
                    type="checkbox"
                    checked={extraIds.includes(o.id)}
                    onChange={() => handleExtraChange(o.id)}
                  />
                  <span>
                    {o.name} (+{o.price} грн)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="order-error">{error}</div>}
          {message && <div className="order-success">{message}</div>}

          <button type="submit" className="btn-primary">
            Підтвердити замовлення
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderPage;

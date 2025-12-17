const express = require('express');
require('dotenv').config();
const cors = require('cors');  
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const salonRoutes = require('./routes/salonRoutes');
const bouquetRoutes = require('./routes/bouquetRoutes');
const optionRoutes = require('./routes/optionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminCustomerRoutes = require('./routes/adminCustomerRoutes');
const adminBouquetRoutes = require('./routes/adminBouquetRoutes');
const adminOptionRoutes = require('./routes/adminOptionRoutes');
const { authRequired, requireRole } = require('./middlewares/authMiddleware');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// health-check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// тест БД
app.get('/db-check', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS result');
    res.json({ db: 'ok', result: rows[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ db: 'error', message: err.message });
  }
});

// auth
app.use('/api/auth', authRoutes);

// публічні та адмінські маршрути салонів
app.use('/api/salons', salonRoutes);

// публічні та адмінські маршрути букетів
app.use('/api/bouquets', bouquetRoutes);

app.use('/api/options', optionRoutes);

app.use('/api/me/orders', orderRoutes);

app.use('/api/admin/orders', adminOrderRoutes);

app.use('/api/me/notifications', notificationRoutes);

app.use('/api/admin/customers', adminCustomerRoutes);

app.use('/api/admin/bouquets', adminBouquetRoutes);

app.use('/api/admin/options', adminOptionRoutes);

// оновлений захищений маршрут для клієнта з даними картки
app.get('/api/me', authRequired, async (req, res) => {
  try {
    // 1. користувач
    const [userRows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];

    // 2. профіль клієнта (картка)
    const [profileRows] = await db.query(
      'SELECT card_type, bonus_balance, discount_percent, free_delivery FROM client_profiles WHERE user_id = ?',
      [user.id]
    );

    const profile = profileRows[0] || null;

    // 3. об’єкт для фронта
    const result = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cardType: profile ? profile.card_type : null,
      bonusBalance: profile ? profile.bonus_balance : 0,
      discountPercent: profile ? profile.discount_percent : 0,
      freeDelivery: profile ? !!profile.free_delivery : false
    };

    res.json(result);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// приклад захищеного маршруту для адміна
app.get('/api/admin/test', authRequired, requireRole('ADMIN'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

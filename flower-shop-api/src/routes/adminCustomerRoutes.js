// routes/adminCustomerRoutes.js
const express = require('express');
const db = require('../config/db');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// список клієнтів з картками
router.get('/', authRequired, requireRole('ADMIN'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         u.id,
         u.name,
         u.email,
         u.role,
         cp.card_type,
         cp.bonus_balance,
         cp.discount_percent,
         cp.free_delivery
       FROM users u
       LEFT JOIN client_profiles cp ON cp.user_id = u.id
       WHERE u.role = 'CLIENT'
       ORDER BY u.id`
    );

    const result = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      cardType: r.card_type,
      bonusBalance: r.bonus_balance ?? 0,
      discountPercent: r.discount_percent ?? 0,
      freeDelivery: !!r.free_delivery
    }));

    res.json(result);
  } catch (err) {
    console.error('Admin get customers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// оновлення картки клієнта
router.patch('/:id/card', authRequired, requireRole('ADMIN'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { cardType } = req.body;

    // допустимі типи
    const allowedTypes = ['NONE', 'SILVER', 'GOLD', null];
    if (!allowedTypes.includes(cardType)) {
      return res.status(400).json({ message: 'Невірний тип картки' });
    }

    // якщо NONE або null — видаляємо профіль
    if (!cardType || cardType === 'NONE') {
      await db.query('DELETE FROM client_profiles WHERE user_id = ?', [userId]);
      return res.json({ message: 'Картку скасовано' });
    }

    // мапа тип → знижка і безкоштовна доставка
    let discountPercent = 0;
    let freeDelivery = 0;

    if (cardType === 'SILVER') {
      discountPercent = 5;
      freeDelivery = 0;
    } else if (cardType === 'GOLD') {
      discountPercent = 10;
      freeDelivery = 1;
    }

    // перевіряємо, чи є вже профіль
    const [rows] = await db.query(
      'SELECT id FROM client_profiles WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      // створюємо новий профіль
      await db.query(
        `INSERT INTO client_profiles 
         (user_id, card_type, bonus_balance, discount_percent, free_delivery)
         VALUES (?, ?, 0, ?, ?)`,
        [userId, cardType, discountPercent, freeDelivery]
      );
    } else {
      // оновлюємо існуючий
      await db.query(
        `UPDATE client_profiles 
         SET card_type = ?, discount_percent = ?, free_delivery = ?
         WHERE user_id = ?`,
        [cardType, discountPercent, freeDelivery, userId]
      );
    }

    res.json({ message: 'Картку оновлено' });
  } catch (err) {
    console.error('Admin update card error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

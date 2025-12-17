// controllers/adminOrderController.js
const db = require('../config/db');

// GET /api/admin/orders?status=NEW
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let sql =
      'SELECT o.*, u.name AS client_name, s.name AS salon_name FROM orders o ' +
      'JOIN users u ON o.client_id = u.id ' +
      'JOIN salons s ON o.salon_id = s.id';
    const params = [];

    if (status) {
      sql += ' WHERE o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = ['NEW', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const conn = await db.getConnection().catch(() => null);
  if (!conn) {
    return res.status(500).json({ message: 'DB connection error' });
  }

  try {
    await conn.beginTransaction();

    // отримуємо замовлення, щоб знати client_id
    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = orders[0];

    // оновлюємо статус
    await conn.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    // створюємо нотифікацію
    let message = '';
    if (status === 'IN_PROGRESS') {
      message = `Ваше замовлення #${orderId} взято в роботу.`;
    } else if (status === 'READY') {
      message = `Ваше замовлення #${orderId} готове до видачі/доставки.`;
    } else if (status === 'DELIVERED') {
      message = `Ваше замовлення #${orderId} доставлено. Дякуємо за покупку!`;
    } else if (status === 'CANCELLED') {
      message = `Ваше замовлення #${orderId} було скасовано.`;
    }

    if (message) {
      await conn.query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [order.client_id, 'ORDER_STATUS', message]
      );
    }

    await conn.commit();

    res.json({ message: 'Status updated', status });
  } catch (err) {
    console.error('Update order status error:', err);
    await conn.rollback();
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

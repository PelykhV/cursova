const db = require('../config/db');
const { calculateOrderPrice } = require('../services/pricingService');

// POST /api/me/orders
exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const {
    salon_id,
    event_date,
    payment_method,
    bouquets,
    packaging_option_id,
    delivery_option_id,
    extra_option_ids
  } = req.body;

  if (!salon_id || !Array.isArray(bouquets) || bouquets.length === 0) {
    return res.status(400).json({ message: 'salon_id and bouquets are required' });
  }

  const conn = await db.getConnection().catch(() => null);
  if (!conn) {
    return res.status(500).json({ message: 'DB connection error' });
  }

  try {
    await conn.beginTransaction();

    // розрахунок ціни
    const pricing = await calculateOrderPrice(
      userId,
      bouquets,
      packaging_option_id,
      delivery_option_id,
      extra_option_ids || []
    );

    // створення замовлення
    const [orderResult] = await conn.query(
      'INSERT INTO orders (client_id, salon_id, status, event_date, total_price, final_price, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        salon_id,
        'NEW',
        event_date || null,
        pricing.totalPrice,
        pricing.finalPrice,
        payment_method || 'CASH'
      ]
    );

    const orderId = orderResult.insertId;

    // order_items
    for (const item of bouquets) {
      const [rows] = await conn.query(
        'SELECT base_price FROM bouquets WHERE id = ?',
        [item.bouquet_id]
      );
      if (rows.length === 0) continue;
      const price = Number(rows[0].base_price);

      await conn.query(
        'INSERT INTO order_items (order_id, bouquet_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.bouquet_id, item.quantity, price]
      );
    }

    // order_options: упаковка, доставка, extra
    if (pricing.packagingOption) {
      await conn.query(
        'INSERT INTO order_options (order_id, option_id, price) VALUES (?, ?, ?)',
        [orderId, pricing.packagingOption.id, pricing.packagingOption.price]
      );
    }

    if (pricing.deliveryOption && pricing.deliveryPrice > 0) {
      await conn.query(
        'INSERT INTO order_options (order_id, option_id, price) VALUES (?, ?, ?)',
        [orderId, pricing.deliveryOption.id, pricing.deliveryPrice]
      );
    }

    for (const opt of pricing.extraOptions) {
      await conn.query(
        'INSERT INTO order_options (order_id, option_id, price) VALUES (?, ?, ?)',
        [orderId, opt.id, opt.price]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Order created',
      order_id: orderId,
      pricing: {
        bouquetsTotal: pricing.bouquetsTotal,
        baseAmount: pricing.baseAmount,
        discountAmount: pricing.discountAmount,
        deliveryPrice: pricing.deliveryPrice,
        totalPrice: pricing.totalPrice,
        finalPrice: pricing.finalPrice
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    await conn.rollback();
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

// GET /api/me/orders
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE client_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/me/orders/:id
exports.getMyOrderById = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  try {
    // саме замовлення (перевіряємо, що належить цьому клієнту)
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND client_id = ?',
      [orderId, userId]
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = orders[0];

    // позиції букетів
    const [items] = await db.query(
      `SELECT oi.*, b.name AS bouquet_name
       FROM order_items oi
       JOIN bouquets b ON oi.bouquet_id = b.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // опції (упаковка, доставка, extra)
    const [options] = await db.query(
      `SELECT oo.*, o.type, o.name
       FROM order_options oo
       JOIN options o ON oo.option_id = o.id
       WHERE oo.order_id = ?`,
      [orderId]
    );

    res.json({
      order,
      items,
      options
    });
  } catch (err) {
    console.error('Get my order by id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

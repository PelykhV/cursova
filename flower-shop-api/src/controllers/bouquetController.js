const db = require('../config/db');

// GET /api/bouquets?event=WEDDING
exports.getBouquets = async (req, res) => {
  try {
    const { event } = req.query;

    let sql = 'SELECT * FROM bouquets';
    const params = [];

    if (event) {
      sql += ' WHERE event_type = ?';
      params.push(event);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Get bouquets error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bouquets/:id
exports.getBouquetById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bouquetRows] = await db.query('SELECT * FROM bouquets WHERE id = ?', [id]);
    if (bouquetRows.length === 0) {
      return res.status(404).json({ message: 'Bouquet not found' });
    }

    const [items] = await db.query(
      'SELECT * FROM bouquet_items WHERE bouquet_id = ?',
      [id]
    );

    res.json({
      ...bouquetRows[0],
      items
    });
  } catch (err) {
    console.error('Get bouquet by id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/bouquets
exports.createBouquet = async (req, res) => {
  try {
    const { name, description, base_price, event_type, is_custom_allowed, items } = req.body;

    if (!name || !base_price || !event_type) {
      return res.status(400).json({ message: 'Name, base_price and event_type are required' });
    }

    const [result] = await db.query(
      'INSERT INTO bouquets (name, description, base_price, event_type, is_custom_allowed) VALUES (?, ?, ?, ?, ?)',
      [
        name,
        description || null,
        base_price,
        event_type,
        is_custom_allowed ? 1 : 0
      ]
    );

    const bouquetId = result.insertId;

    // додати елементи букета, якщо передані
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await db.query(
          'INSERT INTO bouquet_items (bouquet_id, flower_name, quantity, color) VALUES (?, ?, ?, ?)',
          [bouquetId, item.flower_name, item.quantity, item.color || null]
        );
      }
    }

    res.status(201).json({ id: bouquetId, message: 'Bouquet created' });
  } catch (err) {
    console.error('Create bouquet error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

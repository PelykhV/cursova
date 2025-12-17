const db = require('../config/db');

// GET /api/options?type=DELIVERY
exports.getOptions = async (req, res) => {
  try {
    const { type } = req.query;

    let sql = 'SELECT * FROM options';
    const params = [];

    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Get options error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/options  (ADMIN)
exports.createOption = async (req, res) => {
  try {
    const { type, name, price } = req.body;

    if (!type || !name || price == null) {
      return res.status(400).json({ message: 'Type, name and price are required' });
    }

    const [result] = await db.query(
      'INSERT INTO options (type, name, price) VALUES (?, ?, ?)',
      [type, name, price]
    );

    res.status(201).json({
      id: result.insertId,
      type,
      name,
      price
    });
  } catch (err) {
    console.error('Create option error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const db = require('../config/db');

// GET /api/admin/options?type=PACKAGING
exports.getOptions = async (req, res) => {
  try {
    const { type } = req.query;

    let sql = 'SELECT id, name, type, price FROM options';
    const params = [];

    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    sql += ' ORDER BY id';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Admin get options error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/options/:id
exports.updateOption = async (req, res) => {
  const optionId = req.params.id;
  const { name, type, price } = req.body;

  const allowedTypes = ['PACKAGING', 'DELIVERY', 'EXTRA'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid type' });
  }

  try {
    await db.query(
      `UPDATE options
       SET name = ?, type = ?, price = ?
       WHERE id = ?`,
      [name, type, price, optionId]
    );

    res.json({ message: 'Option updated' });
  } catch (err) {
    console.error('Admin update option error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

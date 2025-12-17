const db = require('../config/db');

// GET /api/admin/bouquets
exports.getBouquets = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description, event_type, base_price
       FROM bouquets
       ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    console.error('Admin get bouquets error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// PATCH /api/admin/bouquets/:id
exports.updateBouquet = async (req, res) => {
  const bouquetId = req.params.id;
  const { name, description, event_type, base_price } = req.body;

  try {
    await db.query(
      `UPDATE bouquets
       SET name = ?, description = ?, event_type = ?, base_price = ?
       WHERE id = ?`,
      [name, description, event_type, base_price, bouquetId]
    );

    res.json({ message: 'Bouquet updated' });
  } catch (err) {
    console.error('Admin update bouquet error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBouquet = async (req, res) => {
  const { name, description, event_type, base_price } = req.body;

  if (!name || !event_type || base_price == null) {
    return res.status(400).json({ message: 'Name, event_type і base_price обовʼязкові' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO bouquets (name, description, event_type, base_price)
       VALUES (?, ?, ?, ?)`,
      [name, description || '', event_type, base_price]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Admin create bouquet error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBouquet = async (req, res) => {
  const bouquetId = req.params.id;

  try {
    await db.query('DELETE FROM bouquets WHERE id = ?', [bouquetId]);
    res.json({ message: 'Bouquet deleted' });
  } catch (err) {
    console.error('Admin delete bouquet error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


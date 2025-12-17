const db = require('../config/db');

// GET /api/salons
exports.getSalons = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM salons');
    res.json(rows);
  } catch (err) {
    console.error('Get salons error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/salons
exports.createSalon = async (req, res) => {
  try {
    const { name, address, phone, work_hours } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required' });
    }

    const [result] = await db.query(
      'INSERT INTO salons (name, address, phone, work_hours) VALUES (?, ?, ?, ?)',
      [name, address, phone || null, work_hours || null]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      address,
      phone,
      work_hours
    });
  } catch (err) {
    console.error('Create salon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

// публічний список салонів
router.get('/', salonController.getSalons);

// створення салону (адмін)
router.post('/', authRequired, requireRole('ADMIN'), salonController.createSalon);

module.exports = router;

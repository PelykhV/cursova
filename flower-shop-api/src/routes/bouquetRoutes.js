const express = require('express');
const router = express.Router();
const bouquetController = require('../controllers/bouquetController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

// публічний каталог
router.get('/', bouquetController.getBouquets);
router.get('/:id', bouquetController.getBouquetById);

// створення букета (адмін)
router.post('/', authRequired, requireRole('ADMIN'), bouquetController.createBouquet);

module.exports = router;

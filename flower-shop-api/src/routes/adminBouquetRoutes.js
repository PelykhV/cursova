const express = require('express');
const router = express.Router();
const adminBouquetController = require('../controllers/adminBouquetController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

router.get('/', authRequired, requireRole('ADMIN'), adminBouquetController.getBouquets);

router.patch('/:id', authRequired, requireRole('ADMIN'), adminBouquetController.updateBouquet);

router.post('/', authRequired, requireRole('ADMIN'), adminBouquetController.createBouquet);

router.delete('/:id', authRequired, requireRole('ADMIN'), adminBouquetController.deleteBouquet);

module.exports = router;

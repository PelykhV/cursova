const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

// список замовлень
router.get('/', authRequired, requireRole('ADMIN'), adminOrderController.getOrders);

// зміна статусу
router.patch('/:id/status', authRequired, requireRole('ADMIN'), adminOrderController.updateOrderStatus);

module.exports = router;

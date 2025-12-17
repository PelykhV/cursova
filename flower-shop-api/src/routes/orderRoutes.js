const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authRequired } = require('../middlewares/authMiddleware');

// створення замовлення
router.post('/', authRequired, orderController.createOrder);

// список замовлень клієнта
router.get('/', authRequired, orderController.getMyOrders);

router.get('/:id', authRequired, orderController.getMyOrderById);

module.exports = router;

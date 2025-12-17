const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authRequired } = require('../middlewares/authMiddleware');

router.get('/', authRequired, notificationController.getMyNotifications);
router.patch('/:id/read', authRequired, notificationController.markAsRead);

module.exports = router;

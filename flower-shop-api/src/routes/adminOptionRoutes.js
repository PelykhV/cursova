const express = require('express');
const router = express.Router();
const adminOptionController = require('../controllers/adminOptionController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

router.get('/', authRequired, requireRole('ADMIN'), adminOptionController.getOptions);

router.patch('/:id', authRequired, requireRole('ADMIN'), adminOptionController.updateOption);

module.exports = router;

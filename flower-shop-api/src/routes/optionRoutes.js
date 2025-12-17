const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

// публічний перелік опцій
router.get('/', optionController.getOptions);

// створення опції (ADMIN)
router.post('/', authRequired, requireRole('ADMIN'), optionController.createOption);

module.exports = router;

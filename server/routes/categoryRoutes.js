const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCategories } = require('../controllers/categoryController');

// Protect all category routes
router.use(authMiddleware);

router.get('/', getCategories);

module.exports = router;
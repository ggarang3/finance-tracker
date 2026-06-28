const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { parseAndPreview } = require('../controllers/importController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.use(authMiddleware);
router.post('/pdf', upload.single('file'), parseAndPreview);

module.exports = router;

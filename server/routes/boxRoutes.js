const express = require('express');
const router = express.Router();
const {
  openMysteryBox,
  unlockBox,
  openBox,
} = require('../controllers/boxController');
const authMiddleware = require('../middleware/auth');

router.post('/open/:id', authMiddleware, openMysteryBox);
router.post('/unlock', authMiddleware, unlockBox);
router.post('/open', authMiddleware, openBox);

module.exports = router;

const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  updateProfile,
  getProfile,
  getCoinHistory,
} = require('../controllers/userController');
const router = express.Router();

router.patch('/update-profile', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getProfile);
router.get('/reward-history', authMiddleware, getCoinHistory);

module.exports = router;

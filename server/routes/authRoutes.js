const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  setPin,
  updateWallet,
  registerNewUser,
} = require('../controllers/authController');
const {
  backupMnemonic,
  restoreFromMnemonic,
} = require('../controllers/backupController');
const router = express.Router();

router.post('/set-pin', authMiddleware, setPin);
router.post('/update-wallet', authMiddleware, updateWallet);
router.post('/register', registerNewUser);
router.post('/backup', authMiddleware, backupMnemonic);
router.post('/restore', restoreFromMnemonic);

module.exports = router;

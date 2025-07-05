const express = require('express');
const authMiddleware = require('../middleware/auth');
const { useHint , saveSession, claimStreak} = require('../controllers/sessionController');
const router = express.Router();

router.post('/hint', authMiddleware, useHint);
router.post('/save', authMiddleware, saveSession);
router.post('/streak', authMiddleware, claimStreak);


module.exports = router;

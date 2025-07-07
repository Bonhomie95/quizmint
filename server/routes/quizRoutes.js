const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

router.post('/generate', authMiddleware, generateQuestions);

module.exports = router;

const express = require('express');
const { generateQuestions } = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, generateQuestions);

module.exports = router;

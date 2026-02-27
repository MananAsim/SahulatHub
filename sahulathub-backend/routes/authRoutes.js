const express = require('express');
const { register, login, workerLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login  (client: email + password)
router.post('/login', login);

// @route   POST /api/auth/worker-login  (worker: phone + password)
router.post('/worker-login', workerLogin);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../../controller/auth/authController');
const authenticateToken = require('../../middleware/token-middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
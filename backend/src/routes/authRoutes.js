const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/auth');

// Public endpoints
router.post('/login', authController.login);
router.get('/demo-accounts', authController.getDemoAccounts);

// Protected endpoints
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;

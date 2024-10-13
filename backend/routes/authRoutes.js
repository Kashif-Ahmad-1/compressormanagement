const express = require('express');
const { register, login,logout,forgotPassword,resetPassword } = require('../controllers/authController');
const { authMiddleware } = require('./../middleware/authMiddleware')
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset', resetPassword); // Add this line
module.exports = router;

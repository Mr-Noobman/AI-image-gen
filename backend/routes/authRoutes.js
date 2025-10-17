// ========================================
// Import Required Packages
// ========================================
const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login, getMe } = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// ========================================
// Define Routes
// ========================================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (requires token)
// protect middleware runs first, then getMe
router.get('/me', protect, getMe);

// ========================================
// Export Router
// ========================================
module.exports = router;
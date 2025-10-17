// ========================================
// Import Required Packages
// ========================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ========================================
// Protect Route Middleware
// ========================================

// This middleware checks if user has a valid token
// Use this to protect routes that require authentication
const protect = async (req, res, next) => {
  // Variable to store token
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  // Headers look like: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      // Split "Bearer token" and take the second part (the actual token)
      token = req.headers.authorization.split(' ')[1];

      // Verify token using our secret key
      // jwt.verify() decodes the token and checks if it's valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from decoded token
      // .select('-password') means "get user but exclude password field"
      req.user = await User.findById(decoded.id).select('-password');

      // If user not found in database
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Call next() to pass control to the next middleware/route handler
      next();

    } catch (error) {
      // If token is invalid or expired
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  // If no token was found in headers
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// ========================================
// Export Middleware
// ========================================
module.exports = { protect };
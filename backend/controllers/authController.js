// ========================================
// Import Required Packages
// ========================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ========================================
// Helper Function: Generate JWT Token
// ========================================

// This function creates a JWT token for a user
const generateToken = (id) => {
  // jwt.sign() creates a token with payload and secret
  return jwt.sign(
    { id },                        // Payload: user ID
    process.env.JWT_SECRET,        // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRE }  // Token expires in 7 days
  );
};

// ========================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (anyone can access)
// ========================================
const register = async (req, res) => {
  try {
    // Extract data from request body
    const { username, email, password } = req.body;

    // Validation: Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Hash the password before saving
    // Salt rounds = 10 (higher = more secure but slower)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in database
    const user = await User.create({
      username,
      email,
      password: hashedPassword  // Store hashed password, not plain text!
    });

    // Generate JWT token for the new user
    const token = generateToken(user._id);

    // Send success response with token and user data
   res.status(201).json({
  success: true,
  message: 'User registered successfully',
  token,
  user: {
    id: user._id,
    username: user.username,
    email: user.email
  }
});

  } catch (error) {
    // Handle any errors
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// ========================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ========================================
const login = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validation: Check if fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email (include password field for comparison)
    const user = await User.findOne({ email }).select('+password');

    // If user doesn't exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare provided password with hashed password in database
    // bcrypt.compare() hashes the input and compares with stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    // If password doesn't match
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send success response
    res.status(200).json({
  success: true,
  message: 'Login successful',
  token,
  user: {
    id: user._id,
    username: user.username,
    email: user.email
  }
});

  } catch (error) {
    // Handle any errors
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// ========================================
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (requires token)
// ========================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    // We already have the user from the token verification
    const user = await User.findById(req.user._id)
  .select('-password')
  .populate('createdImages') // <-- Add this line
  .populate('likedImages');  // <-- And this line

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ========================================
// Export Controller Functions
// ========================================
module.exports = {
  register,
  login,
  getMe
};
// ========================================
// Import Required Packages
// ========================================
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  generateImage,
  getAllImages,
  getImageById,
  deleteImage,
  toggleImageLike,    // ✅ NEW
  searchImages        // ✅ NEW
} = require('../controllers/imageController');

// Import auth middleware
const { protect } = require('../middleware/auth');

// ========================================
// Define Routes
// ========================================

// IMPORTANT: Put /search BEFORE /:id to avoid conflicts
// @route   GET /api/images/search?q=query
// @desc    Search images by keywords
// @access  Public
router.get('/search', searchImages);  // ✅ NEW

// @route   POST /api/images/generate
// @desc    Generate new AI image
// @access  Private
router.post('/generate', protect, generateImage);

// @route   GET /api/images
// @desc    Get all images (with pagination)
// @access  Public
router.get('/', getAllImages);

// @route   GET /api/images/:id
// @desc    Get single image by ID
// @access  Public
router.get('/:id', getImageById);

// @route   PUT /api/images/:id/like
// @desc    Like/Unlike an image
// @access  Private
router.put('/:id/like', protect, toggleImageLike);  // ✅ NEW

// @route   DELETE /api/images/:id
// @desc    Delete image
// @access  Private
router.delete('/:id', protect, deleteImage);

// ========================================
// Export Router
// ========================================
module.exports = router;
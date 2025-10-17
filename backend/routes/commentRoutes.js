// ========================================
// Import Required Packages
// ========================================
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  addComment,
  getComments,
  deleteComment,
  toggleCommentLike
} = require('../controllers/commentController');

// Import auth middleware
const { protect } = require('../middleware/auth');

// ========================================
// Define Routes
// ========================================

// @route   POST /api/comments/:imageId
// @desc    Add comment to an image
// @access  Private
router.post('/:imageId', protect, addComment);

// @route   GET /api/comments/:imageId
// @desc    Get all comments for an image
// @access  Public
router.get('/:imageId', getComments);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private (only author)
router.delete('/:commentId', protect, deleteComment);

// @route   PUT /api/comments/:commentId/like
// @desc    Like/Unlike a comment
// @access  Private
router.put('/:commentId/like', protect, toggleCommentLike);

// ========================================
// Export Router
// ========================================
module.exports = router;
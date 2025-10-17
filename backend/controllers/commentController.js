// ========================================
// Import Required Packages
// ========================================
const Comment = require('../models/Comment');
const Image = require('../models/Image');

// ========================================
// @desc    Add comment to an image
// @route   POST /api/comments/:imageId
// @access  Private (requires authentication)
// ========================================
const addComment = async (req, res) => {
  try {
    // Get image ID from URL parameter
    const { imageId } = req.params;
    
    // Get comment text from request body
    const { text } = req.body;

    // Validation: Check if text is provided
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // Check if image exists
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Create new comment
    const newComment = await Comment.create({
      text: text.trim(),  // Remove extra whitespace
      author: req.user._id,  // User ID from auth middleware
      image: imageId
    });

    // Add comment ID to image's comments array
    image.comments.push(newComment._id);
    await image.save();

    // Populate author details before sending response
    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'username');

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment',
      error: error.message
    });
  }
};

// ========================================
// @desc    Get all comments for an image
// @route   GET /api/comments/:imageId
// @access  Public
// ========================================
const getComments = async (req, res) => {
  try {
    // Get image ID from URL parameter
    const { imageId } = req.params;

    // Check if image exists
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Find all comments for this image, populate author, sort by newest first
    const comments = await Comment.find({ image: imageId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });  // -1 means descending (newest first)

    // Send response
    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching comments',
      error: error.message
    });
  }
};

// ========================================
// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private (only author can delete)
// ========================================
const deleteComment = async (req, res) => {
  try {
    // Get comment ID from URL parameter
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the comment author
    // Convert ObjectId to string for comparison
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Remove comment ID from image's comments array
    await Image.findByIdAndUpdate(
      comment.image,
      { $pull: { comments: commentId } }  // $pull removes from array
    );

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment',
      error: error.message
    });
  }
};

// ========================================
// @desc    Like/Unlike a comment
// @route   PUT /api/comments/:commentId/like
// @access  Private (requires authentication)
// ========================================
const toggleCommentLike = async (req, res) => {
  try {
    // Get comment ID from URL parameter
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked this comment
    const alreadyLiked = comment.likedBy.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike: Remove user from likedBy array
      comment.likedBy = comment.likedBy.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      comment.likes -= 1;  // Decrease like count
      
      await comment.save();

      return res.status(200).json({
        success: true,
        message: 'Comment unliked',
        liked: false,
        likes: comment.likes
      });
    } else {
      // Like: Add user to likedBy array
      comment.likedBy.push(req.user._id);
      comment.likes += 1;  // Increase like count
      
      await comment.save();

      return res.status(200).json({
        success: true,
        message: 'Comment liked',
        liked: true,
        likes: comment.likes
      });
    }

  } catch (error) {
    console.error('Toggle comment like error:', error);
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
  addComment,
  getComments,
  deleteComment,
  toggleCommentLike
};
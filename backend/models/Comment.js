// ========================================
// Import Mongoose
// ========================================
const mongoose = require('mongoose');

// ========================================
// Define Comment Schema
// ========================================

const commentSchema = new mongoose.Schema(
  {
    // The actual comment text
    text: {
      type: String,           // Data type is string
      required: true,         // This field is mandatory
      trim: true,             // Remove extra spaces
      minlength: 1,           // At least 1 character
      maxlength: 500          // Maximum 500 characters
    },

    // User who wrote this comment
    author: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to User document
      ref: 'User',                            // References User model
      required: true                          // Must have an author
    },

    // Image this comment belongs to
    image: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to Image document
      ref: 'Image',                           // References Image model
      required: true                          // Must belong to an image
    },

    // Number of likes on this comment
    likes: {
      type: Number,           // Data type is number
      default: 0              // Start with 0 likes
    },

    // Array of users who liked this comment
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,  // Reference to User documents
        ref: 'User'                             // References User model
      }
    ]
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// ========================================
// Create Model from Schema
// ========================================

const Comment = mongoose.model('Comment', commentSchema);

// ========================================
// Export Model
// ========================================

module.exports = Comment;
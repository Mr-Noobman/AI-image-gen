// ========================================
// Import Mongoose
// ========================================
const mongoose = require('mongoose');

// ========================================
// Define Image Schema
// ========================================

const imageSchema = new mongoose.Schema(
  {
    // Prompt used to generate the image
    prompt: {
      type: String,           // Data type is string
      required: true,         // This field is mandatory
      trim: true,             // Remove extra spaces
      minlength: 3,           // Minimum 3 characters
      maxlength: 500          // Maximum 500 characters
    },

    // URL of the generated image
    imageUrl: {
      type: String,           // Data type is string
      required: true          // This field is mandatory
    },

    // User who created this image
    creator: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to User document
      ref: 'User',                            // References User model
      required: true                          // Must have a creator
    },

    // Number of likes this image has
    likes: {
      type: Number,           // Data type is number
      default: 0              // Start with 0 likes
    },

    // Array of users who liked this image
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,  // Reference to User documents
        ref: 'User'                             // References User model
      }
    ],

    // Array of comments on this image
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,  // Reference to Comment documents
        ref: 'Comment'                          // References Comment model
      }
    ],

    // Tags/keywords for searching
    tags: [
      {
        type: String,         // Array of strings
        trim: true            // Remove extra spaces
      }
    ],

    // Is this image public or private?
    isPublic: {
      type: Boolean,          // Data type is true/false
      default: true           // Default to public
    },

    // View count
    views: {
      type: Number,           // Data type is number
      default: 0              // Start with 0 views
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// ========================================
// Add Index for Search Performance
// ========================================

// Create an index on prompt and tags for faster searching
// This makes searching by keywords much faster
imageSchema.index({ prompt: 'text', tags: 'text' });

// ========================================
// Create Model from Schema
// ========================================

const Image = mongoose.model('Image', imageSchema);

// ========================================
// Export Model
// ========================================

module.exports = Image;
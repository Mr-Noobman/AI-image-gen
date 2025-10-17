// ========================================
// Import Mongoose
// ========================================
const mongoose = require('mongoose');

// ========================================
// Define User Schema
// ========================================

// Create a schema - this is like a template for user documents
const userSchema = new mongoose.Schema(
  {
    // Username field
    username: {
      type: String,           // Data type is string
      required: true,         // This field is mandatory
      unique: true,           // No two users can have same username
      trim: true,             // Remove whitespace from beginning and end
      minlength: 3,           // Minimum 3 characters
      maxlength: 30           // Maximum 30 characters
    },

    // Email field
    email: {
      type: String,           // Data type is string
      required: true,         // This field is mandatory
      unique: true,           // No two users can have same email
      lowercase: true,        // Convert to lowercase before saving
      trim: true,             // Remove extra spaces
      match: [                // Validate email format using regex
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },

    // Password field
    password: {
      type: String,           // Data type is string
      required: true,         // This field is mandatory
      minlength: 6            // Minimum 6 characters
    },

    // Array to store IDs of images created by this user
    createdImages: [
      {
        type: mongoose.Schema.Types.ObjectId,  // References another document
        ref: 'Image'                            // References Image model
      }
    ],

    // Array to store IDs of images liked by this user
    likedImages: [
      {
        type: mongoose.Schema.Types.ObjectId,  // References another document
        ref: 'Image'                            // References Image model
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

// Create a model named 'User' using the schema
// This model will interact with 'users' collection in MongoDB
const User = mongoose.model('User', userSchema);

// ========================================
// Export Model
// ========================================

// Export so we can use this model in other files
module.exports = User;
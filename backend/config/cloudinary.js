// ========================================
// Import Cloudinary Package
// ========================================
const cloudinary = require('cloudinary').v2;

// ========================================
// Configure Cloudinary with Credentials
// ========================================

// Set up cloudinary with our account details from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Your cloud name
  api_key: process.env.CLOUDINARY_API_KEY,        // Your API key
  api_secret: process.env.CLOUDINARY_API_SECRET   // Your API secret
});

// ========================================
// Export Configured Cloudinary
// ========================================
module.exports = cloudinary;
// ========================================
// STEP 1: Import Required Packages
// ========================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// ========================================
// STEP 2: Initialize Express App
// ========================================
const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// STEP 3: Connect to Database
// ========================================
connectDB();

// ========================================
// STEP 4: Middleware Setup
// ========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Increased limit for image data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========================================
// STEP 5: Import Routes
// ========================================
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const commentRoutes = require('./routes/commentRoutes');  // ✅ NEW

// ========================================
// STEP 6: Use Routes
// ========================================

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to AI Image Gallery API',
    status: 'Server is running!',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me'
      },
      images: {
        generate: 'POST /api/images/generate',
        getAll: 'GET /api/images',
        search: 'GET /api/images/search?q=keyword',  // ✅ NEW
        getOne: 'GET /api/images/:id',
        like: 'PUT /api/images/:id/like',  // ✅ NEW
        delete: 'DELETE /api/images/:id'
      },
      comments: {  // ✅ NEW
        add: 'POST /api/comments/:imageId',
        getAll: 'GET /api/comments/:imageId',
        delete: 'DELETE /api/comments/:commentId',
        like: 'PUT /api/comments/:commentId/like'
      }
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/comments', commentRoutes);  // ✅ NEW
// ========================================
// STEP 7: Start Server
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
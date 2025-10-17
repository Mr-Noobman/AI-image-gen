// ========================================
// Import Required Packages
// ========================================
const fetch = require('node-fetch');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');
const User = require('../models/User');

// ========================================
// Helper Function: Call Hugging Face API
// ========================================
const callHuggingFaceAPI = async (prompt, apiKey) => {
  // Using Stable Diffusion XL - most reliable model
  const API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';
  
  console.log('🔗 API URL:', API_URL);
  console.log('🔑 API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-use-cache': 'false'  // Don't use cache
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry, bad quality',
        num_inference_steps: 20
      },
      options: {
        wait_for_model: true,  // Wait up to 320 seconds for model to load
        use_cache: false
      }
    })
  });

  return response;
};

// ========================================
// @desc    Generate AI Image using Hugging Face
// @route   POST /api/images/generate
// @access  Private (requires authentication)
// ========================================
const generateImage = async (req, res) => {
  try {
    // Extract prompt from request body
    const { prompt } = req.body;

    // Validation: Check if prompt is provided
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a prompt'
      });
    }

    // Validation: Check prompt length
    if (prompt.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Prompt must be at least 3 characters long'
      });
    }

    // Check if API key exists
    if (!process.env.HUGGINGFACE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Hugging Face API key not configured'
      });
    }

    console.log('🎨 Generating image for prompt:', prompt);
    console.log('⏳ This may take 30-60 seconds on first request...');

    // ========================================
    // STEP 1: Call Hugging Face API
    // ========================================

    let response;
    let imageBuffer;
    let attempts = 0;
    const maxAttempts = 3;

    // Try up to 3 times (in case model is loading)
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}...`);

      try {
        response = await callHuggingFaceAPI(prompt, process.env.HUGGINGFACE_API_KEY);

        // Log response status
        console.log('📡 Response status:', response.status, response.statusText);

        // Check if successful
        if (response.ok) {
          imageBuffer = await response.buffer();
          console.log('✅ Image generated successfully!');
          console.log('📦 Buffer size:', imageBuffer.length, 'bytes');
          break;  // Success! Exit loop
        } else {
          // Get error details
          const errorText = await response.text();
          console.log('❌ Error response:', errorText);

          // Parse error if it's JSON
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: errorText };
          }

          // If model is loading, wait and retry
          if (errorData.error && errorData.error.includes('loading')) {
            const estimatedTime = errorData.estimated_time || 20;
            console.log(`⏳ Model is loading... waiting ${estimatedTime} seconds`);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, estimatedTime * 1000));
            continue;  // Retry
          }

          // If 404 or other error, try different model
          if (response.status === 404 || response.status === 403) {
            console.log('⚠️ Model not accessible, trying alternative...');
            
            // Try alternative model
            const altResponse = await fetch(
              'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  inputs: prompt,
                  options: { wait_for_model: true }
                })
              }
            );

            if (altResponse.ok) {
              imageBuffer = await altResponse.buffer();
              console.log('✅ Image generated using alternative model!');
              break;
            }
          }

          // If last attempt, throw error
          if (attempts === maxAttempts) {
            return res.status(500).json({
              success: false,
              message: 'Failed to generate image after multiple attempts',
              details: errorData.error || errorText,
              troubleshooting: {
                step1: 'Verify your Hugging Face API token at: https://huggingface.co/settings/tokens',
                step2: 'Make sure token has READ permissions',
                step3: 'Check if token is correctly set in .env file (no spaces, no quotes)',
                step4: 'Token should start with: hf_'
              }
            });
          }

          // Wait before retry
          console.log('⏳ Waiting 10 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 10000));

        }
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError.message);
        
        if (attempts === maxAttempts) {
          return res.status(500).json({
            success: false,
            message: 'Network error connecting to Hugging Face',
            error: fetchError.message
          });
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // If no image after all attempts
    if (!imageBuffer) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate image'
      });
    }

    // ========================================
    // STEP 2: Upload Image to Cloudinary
    // ========================================

    console.log('📤 Uploading to Cloudinary...');

    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: 'ai-image-gallery',
      resource_type: 'image'
    });

    console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);

    // ========================================
    // STEP 3: Save Image Data to Database
    // ========================================

    const tags = prompt
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 5);

    const newImage = await Image.create({
      prompt: prompt,
      imageUrl: uploadResult.secure_url,
      creator: req.user._id,
      tags: tags
    });

    console.log('✅ Image saved to database');

    // ========================================
    // STEP 4: Update User's Created Images Array
    // ========================================

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdImages: newImage._id } }
    );

    // ========================================
    // STEP 5: Send Response
    // ========================================

    const populatedImage = await Image.findById(newImage._id)
      .populate('creator', 'username')

    res.status(201).json({
      success: true,
      message: 'Image generated successfully using Hugging Face',
      ai_service: 'Hugging Face Stable Diffusion',
      image: populatedImage
    });

  } catch (error) {
    console.error('❌ Generate image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image generation',
      error: error.message
    });
  }
};

// ========================================
// @desc    Get all images (Gallery)
// @route   GET /api/images
// @access  Public
// ========================================
const getAllImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const images = await Image.find({ isPublic: true })
      .populate('creator', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalImages = await Image.countDocuments({ isPublic: true });
    const totalPages = Math.ceil(totalImages / limit);

    res.status(200).json({
      success: true,
      count: images.length,
      totalImages,
      totalPages,
      currentPage: page,
      images
    });

  } catch (error) {
    console.error('Get all images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching images',
      error: error.message
    });
  }
};

// ========================================
// @desc    Get single image by ID
// @route   GET /api/images/:id
// @access  Public
// ========================================
const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('creator', 'username email profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    image.views += 1;
    await image.save();

    res.status(200).json({
      success: true,
      image
    });

  } catch (error) {
    console.error('Get image by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching image',
      error: error.message
    });
  }
};

// ========================================
// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Private (only creator can delete)
// ========================================
const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    if (image.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this image'
      });
    }

    const publicId = image.imageUrl
      .split('/')
      .slice(-2)
      .join('/')
      .split('.')[0];

    await cloudinary.uploader.destroy(publicId);
    await Image.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { createdImages: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting image',
      error: error.message
    });
  }
};

// ========================================
// @desc    Like/Unlike an image
// @route   PUT /api/images/:id/like
// @access  Private (requires authentication)
// ========================================
const toggleImageLike = async (req, res) => {
  try {
    // Find the image
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check if user already liked this image
    const alreadyLiked = image.likedBy.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike: Remove user from likedBy array
      image.likedBy = image.likedBy.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      image.likes -= 1;  // Decrease like count

      // Also remove from user's likedImages array
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { likedImages: req.params.id } }
      );

      await image.save();

      return res.status(200).json({
        success: true,
        message: 'Image unliked',
        liked: false,
        likes: image.likes
      });
    } else {
      // Like: Add user to likedBy array
      image.likedBy.push(req.user._id);
      image.likes += 1;  // Increase like count

      // Also add to user's likedImages array
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { likedImages: req.params.id } }
      );

      await image.save();

      return res.status(200).json({
        success: true,
        message: 'Image liked',
        liked: true,
        likes: image.likes
      });
    }

  } catch (error) {
    console.error('Toggle image like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ========================================
// @desc    Search images by prompt/tags
// @route   GET /api/images/search
// @access  Public
// ========================================
const searchImages = async (req, res) => {
  try {
    // Get search query from URL parameter
    const { q } = req.query;  // ?q=sunset

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in prompt and tags using text index
    // $text operator searches all fields with text index
    const images = await Image.find({
      $text: { $search: q },  // MongoDB text search
      isPublic: true
    })
      .populate('creator', 'username profilePicture')
      .sort({ score: { $meta: 'textScore' } })  // Sort by relevance
      .limit(20);  // Limit to 20 results

    res.status(200).json({
      success: true,
      count: images.length,
      searchQuery: q,
      images
    });

  } catch (error) {
    console.error('Search images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching images',
      error: error.message
    });
  }
};

// ========================================
// Export Controller Functions
// ========================================
module.exports = {
  generateImage,
  getAllImages,
  getImageById,
  deleteImage,
  toggleImageLike,    // ✅ NEW
  searchImages        // ✅ NEW
};
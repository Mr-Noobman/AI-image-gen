// ========================================
// Import Axios
// ========================================
import axios from 'axios';

// ========================================
// Base URL Configuration
// ========================================

// Base URL for backend API
// Change this when deploying to production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ========================================
// Request Interceptor
// ========================================

// Automatically add auth token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// ========================================
// Response Interceptor
// ========================================

// Handle responses and errors globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, return data
    return response.data;
  },
  (error) => {
    // If unauthorized (401), clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Return error message
    return Promise.reject(error);
  }
);

// ========================================
// AUTH API CALLS
// ========================================

// Register new user
export const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

// Login user
export const login = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

// Get current user profile
export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};

// ========================================
// IMAGE API CALLS
// ========================================

// Generate AI image
export const generateImage = async (prompt) => {
  return await api.post('/images/generate', { prompt });
};

// Get all images (gallery)
export const getAllImages = async (page = 1, limit = 12) => {
  return await api.get(`/images?page=${page}&limit=${limit}`);
};

// Get single image by ID
export const getImageById = async (id) => {
  return await api.get(`/images/${id}`);
};

// Delete image
export const deleteImage = async (id) => {
  return await api.delete(`/images/${id}`);
};

// Like/Unlike image
export const toggleImageLike = async (id) => {
  return await api.put(`/images/${id}/like`);
};

// Search images
export const searchImages = async (query) => {
  return await api.get(`/images/search?q=${query}`);
};

// ========================================
// COMMENT API CALLS
// ========================================

// Add comment to image
export const addComment = async (imageId, text) => {
  return await api.post(`/comments/${imageId}`, { text });
};

// Get all comments for an image
export const getComments = async (imageId) => {
  return await api.get(`/comments/${imageId}`);
};

// Delete comment
export const deleteComment = async (commentId) => {
  return await api.delete(`/comments/${commentId}`);
};

// Like/Unlike comment
export const toggleCommentLike = async (commentId) => {
  return await api.put(`/comments/${commentId}/like`);
};

// ========================================
// Export API instance
// ========================================
export default api;
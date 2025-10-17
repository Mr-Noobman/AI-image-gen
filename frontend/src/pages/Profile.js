// ========================================
// Import Dependencies
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { getAllImages } from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

// ========================================
// Profile Component
// ========================================
const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [myImages, setMyImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalLikes: 0,
    totalViews: 0
  });

  // Fetch user's images - wrapped in useCallback
  const fetchMyImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllImages(1, 100);
      
      const userImages = response.images.filter(
        img => img.creator._id === user._id
      );
      
      setMyImages(userImages);

      const totalLikes = userImages.reduce((sum, img) => sum + img.likes, 0);
      const totalViews = userImages.reduce((sum, img) => sum + img.views, 0);

      setStats({
        totalImages: userImages.length,
        totalLikes,
        totalViews
      });

    } catch (error) {
      toast.error('Failed to load your images');
      console.error('Fetch my images error:', error);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  // Fetch images on mount
  useEffect(() => {
    fetchMyImages();
  }, [fetchMyImages]);

  // Handle image click
  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  return (
    <div className="profile-container">
      <div className="container">
        {/* Profile Header */}
       <div className="profile-header">
  <div className="profile-avatar-section">
    <div className="profile-avatar">
      {user?.username?.charAt(0).toUpperCase()}
    </div>
  </div>
  
  <div className="profile-info">
            <h1 className="profile-username">{user?.username}</h1>
            <p className="profile-email">{user?.email}</p>
            
            {/* Stats */}
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.totalImages}</span>
                <span className="stat-label">Images</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.totalLikes}</span>
                <span className="stat-label">Likes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.totalViews}</span>
                <span className="stat-label">Views</span>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => navigate('/generate')}
              className="btn btn-primary"
            >
              ✨ Create New Image
            </button>
          </div>
        </div>

        {/* User's Images */}
        <div className="profile-content">
          <h2 className="section-title">Your AI Creations 🎨</h2>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your creations...</p>
            </div>
          ) : myImages.length > 0 ? (
            <div className="profile-images-grid">
              {myImages.map((image) => (
                <div 
                  key={image._id} 
                  className="profile-image-card"
                  onClick={() => handleImageClick(image._id)}
                >
                  <div className="profile-image-wrapper">
                    <img 
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="profile-image"
                    />
                    <div className="profile-image-overlay">
                      <p className="profile-image-prompt">{image.prompt}</p>
                    </div>
                  </div>
                  
                  <div className="profile-image-stats">
                    <span className="image-stat">❤️ {image.likes}</span>
                    <span className="image-stat">👁️ {image.views}</span>
                    <span className="image-stat">💬 {image.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-profile">
              <div className="empty-icon">🎨</div>
              <h3>No creations yet</h3>
              <p>Start your AI art journey by generating your first image!</p>
              <button 
                onClick={() => navigate('/generate')}
                className="btn btn-primary"
              >
                Generate Your First Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
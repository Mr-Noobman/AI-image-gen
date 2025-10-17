// ========================================
// Import Dependencies
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllImages, toggleImageLike, searchImages } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { toast } from 'react-toastify';
import './Home.css';

// ========================================
// Home Component
// ========================================
const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // State
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all images - wrapped in useCallback to fix dependency warning
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllImages(page, 12);
      setImages(response.images);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load images');
      console.error('Fetch images error:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch images on component mount and when fetchImages function updates
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchImages();
      return;
    }

    setLoading(true);
    try {
      const response = await searchImages(searchQuery);
      setImages(response.images);
      setTotalPages(1); // Reset pagination for search
      toast.success(`Found ${response.count} images`);
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async (imageId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like images');
      navigate('/login');
      return;
    }

    try {
      const response = await toggleImageLike(imageId);
      // Update the specific image in state
      setImages(images.map(img =>
        img._id === imageId
          ? { ...img, likes: response.likes, liked: response.liked }
          : img
      ));
      toast.success(response.liked ? '❤️ Liked!' : 'Unliked');
    } catch (error) {
      toast.error('Failed to like image');
      console.error('Like error:', error);
    }
  };

  // Handle image click
  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  return (
    <div className="home-container">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">AI Image Gallery 🎨</h1>
          <p className="hero-subtitle">
            Discover amazing AI-generated artwork from our community
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Search by keywords... (e.g., sunset, mountains)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              name="search"
              id="search"
            />
            <button type="submit" className="btn btn-primary">
              🔍 Search
            </button>
          </form>

          {/* CTA Button */}
          {isAuthenticated && (
            <button
              onClick={() => navigate('/generate')}
              className="btn btn-primary btn-large"
            >
              ✨ Generate New Image
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ?
          (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading amazing art...</p>
            </div>
          ) : (
            <>
              {/* Images Grid */}
              {images.length > 0 ? (
                <>
                  <div className="images-grid">
                    {images.map((image) => (
                      <div key={image._id} className="image-card">
                        {/* Image */}
                        <div
                          className="image-wrapper"
                          onClick={() => handleImageClick(image._id)}
                        >
                          <img
                            src={image.imageUrl}
                            alt={image.prompt}
                            className="gallery-image"
                          />
                          <div className="image-overlay">
                            <p className="image-prompt">{image.prompt}</p>
                          </div>
                        </div>

                        {/* Image Info */}
                        <div className="image-info">
                          <div className="image-author">
                            <div className="author-avatar-placeholder">
                              {image.creator?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="author-name">
                              {image.creator?.username}
                            </span>
                          </div>

                          <div className="image-actions">
                            <button
                              onClick={() => handleLike(image._id)}
                              className={`like-btn ${image.liked ? 'liked' : ''}`}
                            >
                              ❤️ {image.likes}
                            </button>
                            <span className="views">👁️ {image.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="btn btn-secondary"
                      >
                        ← Previous
                      </button>
                      <span className="page-info">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="btn btn-secondary"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <h2>No images found 😔</h2>
                  <p>Be the first to create something amazing!</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => navigate('/generate')}
                      className="btn btn-primary"
                    >
                      Generate Image
                    </button>
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default Home;
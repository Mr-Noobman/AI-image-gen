// ========================================
// Import Dependencies
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getImageById, 
  toggleImageLike, 
  deleteImage,
  addComment,
  getComments,
  deleteComment,
  toggleCommentLike 
} from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { toast } from 'react-toastify';
import { downloadImage } from '../utils/downloadImage';
import './ImageDetail.css';

// ========================================
// ImageDetail Component
// ========================================
const ImageDetail = () => {
  const { id } = useParams(); // Get image ID from URL
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // State
  const [image, setImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch image data - wrapped in useCallback
  const fetchImageData = useCallback(async () => {
    try {
      const response = await getImageById(id);
      setImage(response.image);
    } catch (error) {
      toast.error('Failed to load image');
      console.error('Fetch image error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Fetch comments - wrapped in useCallback
  const fetchComments = useCallback(async () => {
    try {
      const response = await getComments(id);
      setComments(response.comments);
    } catch (error) {
      console.error('Fetch comments error:', error);
    }
  }, [id]);

  // Fetch data on mount
  useEffect(() => {
    fetchImageData();
    fetchComments();
  }, [fetchImageData, fetchComments]);

  // Handle like/unlike image
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like');
      navigate('/login');
      return;
    }

    try {
      const response = await toggleImageLike(id);
      setImage({ ...image, likes: response.likes, liked: response.liked });
      toast.success(response.liked ? '❤️ Liked!' : 'Unliked');
    } catch (error) {
      toast.error('Failed to like image');
    }
  };

  // Handle delete image
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteImage(id);
      toast.success('Image deleted successfully');
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  // Handle download image
  const handleDownload = async () => {
    try {
      // Show loading toast
      toast.info('⏳ Preparing download...');

      // Create filename from prompt (sanitize it)
      const filename = image.prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .substring(0, 50);            // Limit length

      // Download the image
      const success = await downloadImage(image.imageUrl, filename);

      if (success) {
        toast.success('✅ Image downloaded successfully!');
      } else {
        toast.error('❌ Failed to download image');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('❌ Failed to download image');
    }
  };

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await addComment(id, commentText);
      setComments([response.comment, ...comments]);
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      const response = await toggleCommentLike(commentId);
      setComments(comments.map(c => 
        c._id === commentId 
          ? { ...c, likes: response.likes, liked: response.liked }
          : c
      ));
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading image...</p>
      </div>
    );
  }

  // If no image found
  if (!image) {
    return null;
  }

  return (
    <div className="image-detail-container">
      <div className="container">
        <div className="detail-content">
          {/* Left Side - Image */}
          <div className="detail-image-section">
            <div className="detail-image-wrapper">
              <img 
                src={image.imageUrl} 
                alt={image.prompt}
                className="detail-image"
              />
            </div>
            
            {/* Image Actions */}
            <div className="detail-actions">
              <button 
                onClick={handleLike}
                className={`action-btn like-btn ${image.liked ? 'liked' : ''}`}
              >
                ❤️ {image.likes} Likes
              </button>
              
              {/* Download Button */}
              <button 
                onClick={handleDownload}
                className="action-btn download-btn"
                title="Download image"
              >
                📥 Download
              </button>
              
              <span className="action-info">
                👁️ {image.views} Views
              </span>
            </div>
          </div>

          {/* Right Side - Info & Comments */}
          <div className="detail-info-section">
            {/* Creator Info */}
            <div className="creator-section">
  <div className="creator-avatar-large">
    {image.creator?.username?.charAt(0).toUpperCase()}
  </div>
  <div className="creator-info">
    <h3>{image.creator?.username}</h3>
    <p className="created-date">
      {new Date(image.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
  </div>
  
  {/* Delete button if owner */}
  {user?._id === image.creator?._id && (
    <button 
      onClick={handleDelete}
      className="btn btn-danger btn-delete"
    >
      🗑️ Delete
    </button>
  )}
</div>

            {/* Prompt */}
            <div className="prompt-section">
              <h4>Prompt</h4>
              <p className="prompt-text">"{image.prompt}"</p>
            </div>

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="tags-section">
                <h4>Tags</h4>
                <div className="tags-list">
                  {image.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="comments-section">
              <h4>Comments ({comments.length})</h4>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="comment-form">
                  <textarea
                    className="comment-input"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={submittingComment}
                    rows="3"
                  />
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              ) : (
                <p className="login-prompt">
                  <a href="/login">Login</a> to comment
                </p>
              )}

              {/* Comments List */}
              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
  <div className="comment-avatar">
    {comment.author?.username?.charAt(0).toUpperCase()}
  </div>
  <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">
                            {comment.author?.username}
                          </span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                        <div className="comment-actions">
                          <button 
                            onClick={() => handleLikeComment(comment._id)}
                            className={`comment-like-btn ${comment.liked ? 'liked' : ''}`}
                          >
                            ❤️ {comment.likes}
                          </button>
                          {user?._id === comment.author?._id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="comment-delete-btn"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;
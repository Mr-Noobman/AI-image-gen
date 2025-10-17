// ========================================
// Import Dependencies
// ========================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateImage } from '../services/api';
import { toast } from 'react-toastify';
import './Generate.css';

// ========================================
// Generate Component
// ========================================
const Generate = () => {
  const navigate = useNavigate();

  // State
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  // Sample prompts for inspiration
  const samplePrompts = [
    'a serene lake surrounded by mountains at sunset',
    'a futuristic city with flying cars at night',
    'a cute cat wearing a space helmet',
    'an ancient temple in a mystical forest',
    'a cozy cabin in snowy mountains',
    'a magical underwater palace with colorful corals'
  ];

  // Handle prompt submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (prompt.length < 3) {
      toast.error('Prompt must be at least 3 characters');
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      // Show info toast
      toast.info('🎨 Generating your AI masterpiece... This may take 30-60 seconds!');

      // Call API to generate image
      const response = await generateImage(prompt);

      // Set generated image
      setGeneratedImage(response.image);

      // Show success message
      toast.success('Image generated successfully! 🎉');

    } catch (error) {
      // Show error message
      const message = error.response?.data?.message || 'Failed to generate image. Please try again.';
      toast.error(message);
      console.error('Generate error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use sample prompt
const handleSamplePrompt = (sample) => {
  setPrompt(sample);
  toast.info('Prompt filled! Click generate to create.');
};

  // View in gallery
  const viewInGallery = () => {
    if (generatedImage) {
      navigate(`/image/${generatedImage._id}`);
    }
  };

  return (
    <div className="generate-container">
      <div className="container">
        <div className="generate-content">
          {/* Left Side - Form */}
          <div className="generate-form-section">
            <h1 className="generate-title">✨ Generate AI Art</h1>
            <p className="generate-subtitle">
              Describe what you want to see, and AI will create it for you!
            </p>

            {/* Generation Form */}
            <form onSubmit={handleSubmit} className="prompt-form">
              <div className="form-group">
                <label htmlFor="prompt" className="form-label">
                  Your Prompt
                </label>
                <textarea
                  id="prompt"
                  className="form-textarea"
                  placeholder="Describe your image... (e.g., a beautiful sunset over mountains, digital art)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  rows="4"
                />
                <small className="char-count">
                  {prompt.length} characters
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-generate"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Generating... (30-60s)
                  </>
                ) : (
                  <>
                    🎨 Generate Image
                  </>
                )}
              </button>
            </form>

            {/* Sample Prompts */}
            <div className="sample-prompts">
              <h3>💡 Need inspiration? Try these:</h3>
              <div className="sample-grid">
                {samplePrompts.map((sample, index) => (
                  <button
  key={index}
  onClick={() => handleSamplePrompt(sample)}
  className="sample-btn"
  disabled={loading}
>
  {sample}
</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="generate-preview-section">
            {loading ? (
              <div className="preview-loading">
                <div className="loading-spinner-large"></div>
                <h3>Creating your masterpiece...</h3>
                <p>This usually takes 30-60 seconds</p>
                <div className="loading-tips">
                  <p>💡 <strong>Tip:</strong> Be specific in your prompts for better results!</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="preview-result">
                <div className="result-image-wrapper">
                  <img
                    src={generatedImage.imageUrl}
                    alt={generatedImage.prompt}
                    className="result-image"
                  />
                </div>
                <div className="result-info">
                  <h3>✨ Your Creation</h3>
                  <p className="result-prompt">"{generatedImage.prompt}"</p>
                  <div className="result-actions">
                    <button
                      onClick={viewInGallery}
                      className="btn btn-primary"
                    >
                      👁️ View Details
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedImage(null);
                        setPrompt('');
                      }}
                      className="btn btn-secondary"
                    >
                      🎨 Create Another
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="preview-placeholder">
                <div className="placeholder-icon">🎨</div>
                <h3>Your AI art will appear here</h3>
                <p>Enter a prompt and click generate to start creating!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;
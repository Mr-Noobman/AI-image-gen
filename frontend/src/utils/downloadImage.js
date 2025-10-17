// ========================================
// Download Image Utility Function
// ========================================

/**
 * Downloads an image from a URL to user's device
 * @param {string} imageUrl - The URL of the image to download
 * @param {string} filename - The desired filename (without extension)
 */
export const downloadImage = async (imageUrl, filename = 'ai-generated-image') => {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    
    // Check if fetch was successful
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    // Convert response to blob
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Set the download filename
    // Extract extension from URL or default to jpg
    const extension = imageUrl.split('.').pop().split('?')[0] || 'jpg';
    link.download = `${filename}.${extension}`;

    // Append link to body (required for Firefox)
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up: remove the link and revoke the blob URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

// ========================================
// Alternative: Force Download via Proxy
// ========================================
// This function works better for CORS-restricted images

/**
 * Downloads image by creating a canvas and converting to blob
 * Useful for CORS-restricted images
 * @param {string} imageUrl - The URL of the image
 * @param {string} filename - The desired filename
 */
export const downloadImageViaCanvas = async (imageUrl, filename = 'ai-generated-image') => {
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = new Image();
    
    // Enable CORS
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Create a canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          // Create download link
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${filename}.png`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          window.URL.revokeObjectURL(blobUrl);
          resolve(true);
        }, 'image/png');

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = imageUrl;
  });
};

// ========================================
// Export both functions
// ========================================
export default downloadImage;
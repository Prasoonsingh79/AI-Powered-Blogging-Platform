/**
 * Helper function to get the correct image URL
 * @param {string} imagePath - The path to the image (can be relative or absolute)
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Remove any leading slashes to prevent double slashes
  const cleanPath = imagePath.replace(/^\/+/, '');
  
  // For local development
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5000/${cleanPath}`;
  }
  
  // For production, use the environment variable if available
  return `${process.env.REACT_APP_API_URL || ''}/${cleanPath}`;
};

/**
 * Fallback function when an image fails to load
 * @param {Event} e - The error event
 * @param {string} fallbackText - Optional text to show in the fallback image
 * @returns {string} - The fallback image URL
 */
export const onImageError = (e, fallbackText = 'Image not found') => {
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = `https://via.placeholder.com/800x400?text=${encodeURIComponent(fallbackText)}`;
  return e.target.src;
};

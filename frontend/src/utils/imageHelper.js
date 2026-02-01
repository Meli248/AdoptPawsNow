export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, prepend backend URL
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${backendUrl}${imageUrl}`;
};
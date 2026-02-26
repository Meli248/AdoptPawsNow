export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';

  // If already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Otherwise, prepend backend URL (strip /api if present)
  const apiRoot = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendUrl = apiRoot.replace(/\/api\/?$/, '');

  // Ensure imageUrl starts with / if it doesn't
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return `${backendUrl}${cleanPath}`;
};
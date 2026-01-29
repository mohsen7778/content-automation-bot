// src/services/pexels.js
const axios = require('axios');

/**
 * Searches Pexels for a high-quality vertical image.
 * @param {string} query - The topic to search for (e.g., "Yoga", "Pasta").
 * @returns {Promise<string|null>} - The raw image URL or null if failed.
 */
const getImages = async (query) => {
  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: process.env.PEXELS_API_KEY
      },
      params: {
        query: query,
        per_page: 1,
        orientation: 'portrait', // Forces vertical images for Pinterest
        size: 'medium' // 'large' or 'original' is safer for quality, 'medium' is faster
      }
    });

    if (response.data.photos && response.data.photos.length > 0) {
      // We grab the 'original' size for best editing quality
      return response.data.photos[0].src.original;
    }
    
    console.log(`⚠️ No images found on Pexels for: ${query}`);
    return null;

  } catch (error) {
    console.error(`❌ Pexels API Error: ${error.message}`);
    return null;
  }
};

module.exports = { getImages };

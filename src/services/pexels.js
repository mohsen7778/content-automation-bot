// src/services/pexels.js
const axios = require('axios');

/**
 * Searches Pexels for both a horizontal (landscape) and a vertical (portrait) image.
 * @param {string} query - The topic to search for.
 * @returns {Promise<{landscapeUrl: string|null, portraitUrl: string|null}>}
 */
const getImages = async (query) => {
  // Create a reusable Pexels client
  const pexelsClient = axios.create({
    baseURL: 'https://api.pexels.com/v1/',
    headers: {
      Authorization: process.env.PEXELS_API_KEY
    }
  });

  try {
    // 1. Define the two search requests
    // Landscape for Blogger (large size is usually sufficient)
    const landscapeRequest = pexelsClient.get('search', {
      params: { query, per_page: 1, orientation: 'landscape', size: 'large' }
    });

    // Portrait for Pinterest/Telegram (original size for best editing quality)
    const portraitRequest = pexelsClient.get('search', {
      params: { query, per_page: 1, orientation: 'portrait', size: 'original' }
    });

    // 2. Run them in parallel for speed
    const [landscapeRes, portraitRes] = await Promise.all([landscapeRequest, portraitRequest]);

    // 3. Extract URLs
    const landscapeUrl = landscapeRes.data.photos.length > 0
      ? landscapeRes.data.photos[0].src.large
      : null;

    const portraitUrl = portraitRes.data.photos.length > 0
      ? portraitRes.data.photos[0].src.original
      : null;

    // Log warnings if one is missing
    if (!landscapeUrl) console.warn(`⚠️ Pexels: No landscape image found for '${query}'`);
    if (!portraitUrl) console.warn(`⚠️ Pexels: No portrait image found for '${query}'`);

    // 4. Return object with both URLs
    return { landscapeUrl, portraitUrl };

  } catch (error) {
    console.error(`❌ Pexels API Error: ${error.message}`);
    // Return nulls so the main bot can handle the failure
    return { landscapeUrl: null, portraitUrl: null };
  }
};

module.exports = { getImages };

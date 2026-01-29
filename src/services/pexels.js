// src/services/pexels.js
const axios = require('axios');

/**
 * Searches Pexels for both landscape and portrait images.
 * Includes fallback logic to prevent bot crashes on API errors.
 */
const getImages = async (query) => {
  const pexelsClient = axios.create({
    baseURL: 'https://api.pexels.com/v1/',
    headers: { Authorization: process.env.PEXELS_API_KEY }
  });

  // 1. Clean the query (Replace underscores/hyphens with spaces)
  // "minimalist_living" -> "minimalist living"
  const cleanQuery = query.replace(/[_-]/g, ' ');

  const searchPexels = async (searchParams) => {
    try {
      return await pexelsClient.get('search', { params: searchParams });
    } catch (err) {
      console.warn(`⚠️ Pexels search failed for query: "${searchParams.query}". Status: ${err.response?.status}`);
      return null;
    }
  };

  try {
    // 2. Define Requests
    const landscapeReq = searchPexels({ query: cleanQuery, per_page: 1, orientation: 'landscape', size: 'large' });
    const portraitReq = searchPexels({ query: cleanQuery, per_page: 1, orientation: 'portrait', size: 'original' });

    let [landscapeRes, portraitRes] = await Promise.all([landscapeReq, portraitReq]);

    // 3. Fallback Mechanism (If 500 Error or No Results)
    // If specific topic fails, search for a safe generic term "nature"
    if (!landscapeRes || landscapeRes.data.photos.length === 0) {
      console.log("🔄 Switching to fallback landscape image...");
      landscapeRes = await searchPexels({ query: 'nature', per_page: 1, orientation: 'landscape', size: 'large' });
    }
    if (!portraitRes || portraitRes.data.photos.length === 0) {
      console.log("🔄 Switching to fallback portrait image...");
      portraitRes = await searchPexels({ query: 'nature', per_page: 1, orientation: 'portrait', size: 'original' });
    }

    // 4. Extract URLs (Safe extraction)
    const landscapeUrl = landscapeRes?.data?.photos?.[0]?.src?.large || 
                         "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg"; // Ultimate fallback

    const portraitUrl = portraitRes?.data?.photos?.[0]?.src?.original || 
                        "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg"; // Ultimate fallback

    return { landscapeUrl, portraitUrl };

  } catch (error) {
    console.error(`❌ Critical Pexels Error: ${error.message}`);
    // Return hardcoded safe images so the bot NEVER dies
    return { 
      landscapeUrl: "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg", 
      portraitUrl: "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg" 
    };
  }
};

module.exports = { getImages };

// src/services/pexels.js
const axios = require('axios');

/**
 * Fetches a random high-quality image from Pexels based on keywords
 */
async function getPexelsImage(query) {
    try {
        // We search for 15 images and pick a random one from that list for variety
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=15`, {
            headers: {
                Authorization: process.env.PEXELS_API_KEY
            }
        });

        if (response.data.photos && response.data.photos.length > 0) {
            const randomIndex = Math.floor(Math.random() * response.data.photos.length);
            return response.data.photos[randomIndex].src.large2x;
        }
        
        // Fallback image if no results found
        return "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg";
    } catch (error) {
        console.error("Pexels API Error:", error.response ? error.response.data : error.message);
        return "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg";
    }
}

module.exports = { getPexelsImage };

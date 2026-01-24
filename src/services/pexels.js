const axios = require('axios');

async function getPexelsImage(query) {
    try {
        // Search for images based on the blog category or title
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
            headers: {
                Authorization: process.env.PEXELS_API_KEY
            }
        });

        if (response.data.photos && response.data.photos.length > 0) {
            // Return the high-res image URL
            return response.data.photos[0].src.large2x;
        }
        // Fallback image if nothing is found
        return "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg";
    } catch (error) {
        console.error("Pexels Error:", error.message);
        return "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg";
    }
}

module.exports = { getPexelsImage };

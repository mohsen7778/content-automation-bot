const axios = require('axios');

async function getImages(query, count = 1) {
    try {
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=${count}`, {
            headers: {
                Authorization: process.env.PEXELS_API_KEY
            }
        });

        if (response.data.photos && response.data.photos.length > 0) {
            return response.data.photos.map(photo => photo.src.large2x);
        }
        return ["https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg"];
    } catch (error) {
        console.error("Pexels Error:", error.message);
        return ["https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg"];
    }
}

module.exports = { getImages };

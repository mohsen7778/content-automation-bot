const axios = require('axios');
const fs = require('fs');
const path = require('path');

const statePath = path.join(__dirname, 'data', 'state.json');

async function getImages(query, count = 1) {
    try {
        // 1. Fetch 20 results so we have plenty of options
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=20&orientation=landscape`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });

        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        const photos = response.data.photos;

        // 2. Filter out images we used recently
        const newPhotos = photos.filter(p => !state.usedImageUrls.includes(p.src.large2x));
        
        // 3. Pick the best one (or first available)
        const selectedImage = newPhotos.length > 0 ? newPhotos[0].src.large2x : photos[0].src.large2x;

        // 4. Save this image to "used" list (keep only last 50 to save space)
        state.usedImageUrls.push(selectedImage);
        if (state.usedImageUrls.length > 50) state.usedImageUrls.shift();
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

        return [selectedImage];
    } catch (error) {
        console.error("Pexels Error:", error.message);
        return ["https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg"];
    }
}

module.exports = { getImages };

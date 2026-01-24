const axios = require('axios');
const fs = require('fs');
const path = require('path');

const statePath = path.join(__dirname, '..', '..', 'data', 'state.json');

async function getImages(query, count = 1) {
    try {
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=15&orientation=landscape`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });

        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        const photos = response.data.photos;

        let selectedUrl = photos[0].src.large2x;
        for (let photo of photos) {
            if (!state.usedImageUrls.includes(photo.src.large2x)) {
                selectedUrl = photo.src.large2x;
                break;
            }
        }

        state.usedImageUrls.push(selectedUrl);
        if (state.usedImageUrls.length > 100) state.usedImageUrls.shift();
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

        return [selectedUrl];
    } catch (error) {
        console.error("Pexels Error:", error.message);
        return ["https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg"];
    }
}

module.exports = { getImages };

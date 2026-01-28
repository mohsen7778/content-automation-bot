const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const statePath = path.join(__dirname, '..', '..', 'data', 'state.json');

async function getImages(query, count = 1) {
    try {
        console.log(`Searching Pexels for: ${query}`);
        
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=15&orientation=landscape`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });

        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        const photos = response.data.photos;

        if (!photos || photos.length === 0) {
            throw new Error("No photos found on Pexels.");
        }

        let selectedPexelsUrl = photos[0].src.large2x;
        for (let photo of photos) {
            if (!state.usedImageUrls.includes(photo.src.large2x)) {
                selectedPexelsUrl = photo.src.large2x;
                break;
            }
        }

        console.log("Processing image with Cloudinary...");

        const uploadResult = await cloudinary.uploader.upload(selectedPexelsUrl, {
            folder: "mia-blog-images",
        });

        // --- INTELLIGENT EDITING SETTINGS ---
        const finalUrl = cloudinary.url(uploadResult.public_id, {
            width: 1200,
            height: 630,
            crop: "pad",             // Puts the whole image in the box (No cropping)
            background: "gen_fill",  // AI paints the empty space to match the scene
            effect: "enhance",       // AI color/contrast correction
            quality: "auto",
            fetch_format: "auto"
        });

        console.log("Image processed successfully:", finalUrl);

        state.usedImageUrls.push(selectedPexelsUrl);
        if (state.usedImageUrls.length > 100) state.usedImageUrls.shift();
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

        return [finalUrl];

    } catch (error) {
        console.error("Image Service Error:", error.message);
        return ["https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg"];
    }
}

module.exports = { getImages };

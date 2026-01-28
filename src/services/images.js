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
        
        // 1. RANDOMIZE SEARCH (Fixes "Same Image" issue)
        // We search a random page between 1 and 50
        const randomPage = Math.floor(Math.random() * 50) + 1;
        
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=15&orientation=landscape&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });

        const photos = response.data.photos;

        if (!photos || photos.length === 0) {
            console.log("Random page empty, retrying page 1...");
            const retry = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=15&orientation=landscape`, {
                headers: { Authorization: process.env.PEXELS_API_KEY }
            });
            if (!retry.data.photos.length) throw new Error("No photos found.");
            photos.push(...retry.data.photos);
        }

        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        
        // Select a fresh image
        let selectedPexelsUrl = photos[0].src.large2x;
        for (let photo of photos) {
            if (!state.usedImageUrls.includes(photo.src.large2x)) {
                selectedPexelsUrl = photo.src.large2x;
                break;
            }
        }

        console.log("Processing image with Cloudinary...");

        // 2. Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(selectedPexelsUrl, {
            folder: "mia-blog-images",
        });

        // 3. GENERATE SMART URL (No Crash Risk)
        // g_auto: AI finds the face/pet and keeps it centered.
        // c_fill: Fills the 1200x630 box perfectly.
        const finalUrl = cloudinary.url(uploadResult.public_id, {
            width: 1200,
            height: 630,
            crop: "fill",    // Standard Crop
            gravity: "auto", // AI Focus (Keeps subject in view)
            effect: "enhance", // Auto-Color correction
            quality: "auto",
            fetch_format: "auto"
        });

        console.log("Image Ready:", finalUrl);

        state.usedImageUrls.push(selectedPexelsUrl);
        if (state.usedImageUrls.length > 100) state.usedImageUrls.shift();
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

        return [finalUrl];

    } catch (error) {
        console.error("Image Service Error:", error.message);
        // If this fallback appears, check the GitHub Action logs for the specific error message
        return ["https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg"];
    }
}

module.exports = { getImages };

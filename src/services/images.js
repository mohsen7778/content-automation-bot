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
        
        // FIX: Randomize the page number (1 to 50) to get different images every time
        const randomPage = Math.floor(Math.random() * 50) + 1;

        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=15&orientation=landscape&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });

        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        const photos = response.data.photos;

        if (!photos || photos.length === 0) {
            // If random page is empty, try page 1 as backup
            console.log("Random page empty, trying page 1...");
            const backup = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=15&orientation=landscape`, {
                 headers: { Authorization: process.env.PEXELS_API_KEY }
            });
            photos.push(...backup.data.photos);
        }
        
        if (!photos || photos.length === 0) throw new Error("No photos found.");

        let selectedPexelsUrl = photos[0].src.large2x;
        
        // Try to find one we haven't used
        for (let photo of photos) {
            if (!state.usedImageUrls.includes(photo.src.large2x)) {
                selectedPexelsUrl = photo.src.large2x;
                break;
            }
        }

        console.log("Processing image with Cloudinary...");

        // 1. Upload
        const uploadResult = await cloudinary.uploader.upload(selectedPexelsUrl, {
            folder: "mia-blog-images",
        });

        // 2. FORCE AI GENERATION (Wait for it)
        const explicitResult = await cloudinary.uploader.explicit(uploadResult.public_id, {
            type: "upload",
            eager: [
                {
                    width: 1200,
                    height: 630,
                    crop: "pad",            
                    background: "gen_fill", 
                    effect: "enhance"       
                }
            ],
            eager_async: false 
        });

        const finalUrl = explicitResult.eager[0].secure_url;
        console.log("AI Image Ready:", finalUrl);

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

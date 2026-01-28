const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getImages(query, count = 1) {
    try {
        console.log(`Searching Pexels for: ${query}`);

        // 1. GENERATE RANDOMNESS (Replaces the need for history file)
        // Search a random page between 1 and 100 to find unique images
        const randomPage = Math.floor(Math.random() * 100) + 1;

        const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=10&orientation=landscape&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });

        const photos = response.data.photos;

        // Backup: If random page is empty, go back to Page 1
        if (!photos || photos.length === 0) {
            console.log("Random page empty, using Page 1...");
            const backup = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=10&orientation=landscape`, {
                headers: { Authorization: process.env.PEXELS_API_KEY }
            });
            photos.push(...backup.data.photos);
        }

        if (!photos || photos.length === 0) throw new Error("No photos found on Pexels.");

        // Pick a random image from the 10 results
        const randomImageIndex = Math.floor(Math.random() * photos.length);
        const selectedPexelsUrl = photos[randomImageIndex].src.large2x;

        console.log("Processing image with Cloudinary...");

        // 2. UPLOAD TO CLOUDINARY
        const uploadResult = await cloudinary.uploader.upload(selectedPexelsUrl, {
            folder: "mia-blog-images",
        });

        // 3. APPLY SMART CROP (No Add-ons Required)
        // This ensures the image is 1200x630 and centered on the subject
        const finalUrl = cloudinary.url(uploadResult.public_id, {
            width: 1200,
            height: 630,
            crop: "fill",
            gravity: "auto",  // AI Auto-Focus
            effect: "enhance", // Auto-Color
            quality: "auto",
            fetch_format: "auto"
        });

        console.log("Image Ready:", finalUrl);
        return [finalUrl];

    } catch (error) {
        // IF YOU SEE THIS LOG IN GITHUB, IT MEANS API KEYS ARE WRONG
        console.error("CRITICAL ERROR:", error.message);
        if (error.response) console.error("API Response:", error.response.data);
        
        // Return fallback only if real crash happens
        return ["https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg"];
    }
}

module.exports = { getImages };

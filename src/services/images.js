const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getImages(query, pinHook) {
  try {
    // 1. Get landscape image for Blogger
    const landscapeRes = await axios.get(`https://api.pexels.com/v1/search?query=${query}&orientation=landscape&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });
    const bloggerImage = landscapeRes.data.photos[0]?.src.large2x;

    // 2. Get NATIVE PORTRAIT image for Pinterest
    const portraitRes = await axios.get(`https://api.pexels.com/v1/search?query=${query}&orientation=portrait&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });
    
    // We use the .src.portrait which is exactly 800x1200
    const rawPinterestImage = portraitRes.data.photos[0]?.src.portrait;

    if (!rawPinterestImage) throw new Error("No portrait image found on Pexels");

    // 3. Add Sticker Overlay (NO CROP, NO SHRINK)
    const cleanHook = encodeURIComponent(pinHook.toUpperCase());
    const pinterestImage = cloudinary.url(rawPinterestImage, {
      type: "fetch",
      transformation: [
        // We removed width/height/crop here to keep native pixels
        { effect: "brightness_speed:-5" }, 
        {
          underlay: { background: "black", opacity: 75 },
          width: "0.9", // Uses 90% of the image width automatically
          height: 180,
          gravity: "south",
          y: 80
        },
        { 
          color: "white",
          overlay: { 
            font_family: "Inter", 
            font_size: 50, 
            font_weight: "bold", 
            text: cleanHook 
          },
          gravity: "south",
          y: 130 
        }
      ]
    });

    return { bloggerImage, pinterestImage };
  } catch (error) {
    console.error("Image Service Error:", error.message);
    throw error;
  }
}

module.exports = { getImages };

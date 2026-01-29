const axios = require("axios");

async function getImages(imagePrompt, pinHook) {
  try {
    console.log(`🎨 Searching Pexels for: "${imagePrompt}"`);
    
    // 1. Fetch Image from Pexels
    const pexelsResponse = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(imagePrompt)}&per_page=1`,
      {
        headers: { Authorization: process.env.PEXELS_API_KEY }
      }
    );

    if (!pexelsResponse.data.photos || pexelsResponse.data.photos.length === 0) {
      throw new Error("No images found on Pexels for this prompt.");
    }

    const pexelsUrl = pexelsResponse.data.photos[0].src.large2x;
    
    // 2. Clean the Pin Hook for Cloudinary URL safety
    // Removes special characters that break Cloudinary's URL parser
    const cleanHook = encodeURIComponent(pinHook.replace(/[^a-zA-Z0-9 ]/g, ''));

    // 3. Construct Pinterest "Sticker" URL
    // We use l_text: to tell Cloudinary this is a TEXT layer, not an image layer.
    const pinterestImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/` +
      // Step A: Base Portrait Crop (Pinterest loves 1000x1500)
      `w_1000,h_1500,c_fill,g_auto/` +
      // Step B: Add a semi-transparent black bar at the bottom for readability
      `w_1000,h_400,c_fill,b_black,o_70,g_south,l_pixel/fl_layer_apply/` +
      // Step C: Add the Hook Text (The 'l_text:' prefix is the fix for your 400 error)
      `co_white,g_south,y_100,w_800,c_fit,l_text:Verdana_80_bold_center:${cleanHook}/` +
      `fl_layer_apply/` +
      // Step D: The source image from Pexels
      `${pexelsUrl}`;

    console.log("✅ Images prepared successfully.");

    return { 
      bloggerImage: pexelsUrl, // Clean landscape image for the blog
      pinterestImage: pinterestImage // Branded portrait image for Pinterest/Telegram
    };

  } catch (error) {
    console.error(`❌ Image Service Error: ${error.message}`);
    // Fallback images in case Pexels/Cloudinary fails so the bot doesn't crash
    return {
      bloggerImage: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      pinterestImage: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
    };
  }
}

module.exports = { getImages };

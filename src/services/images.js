const axios = require("axios");

async function getImages(imagePrompt, pinHook) {
  try {
    console.log(`🎨 Fetching native orientation images for: "${imagePrompt}"`);
    
    const [horizontal, vertical] = await Promise.all([
      axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(imagePrompt)}&orientation=landscape&per_page=1`, {
        headers: { Authorization: process.env.PEXELS_API_KEY }
      }),
      axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(imagePrompt)}&orientation=portrait&per_page=1`, {
        headers: { Authorization: process.env.PEXELS_API_KEY }
      })
    ]);

    const bloggerImage = horizontal.data.photos[0]?.src?.large2x || "";
    const pexelsVerticalUrl = vertical.data.photos[0]?.src?.large2x || "";
    
    const cleanHook = encodeURIComponent(pinHook.replace(/[^a-zA-Z0-9 ]/g, ''));
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    // AI Positioned Pinterest Image (No forced crop)
    const pinterestImage = `https://res.cloudinary.com/${cloudName}/image/fetch/` +
      `w_1000,h_500,c_fill,b_black,o_60,l_text:Verdana_80_bold_center:${cleanHook}/` +
      `fl_layer_apply,g_auto/` + 
      `${pexelsVerticalUrl}`;

    return { bloggerImage, pinterestImage };

  } catch (error) {
    console.error(`❌ Image Service Error: ${error.message}`);
    const fallback = "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";
    return { bloggerImage: fallback, pinterestImage: fallback };
  }
}

module.exports = { getImages };

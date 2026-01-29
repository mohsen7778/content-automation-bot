const axios = require("axios");

async function getImages(imagePrompt, pinHook) {
  try {
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
    
    // Clean hook for URL safety
    const cleanHook = encodeURIComponent(pinHook.replace(/[^a-zA-Z0-9 ]/g, ' '));
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const pinterestImage = `https://res.cloudinary.com/${cloudName}/image/fetch/` +
      `w_1000,h_1500,c_fill,f_jpg,q_auto/` + 
      `co_white,b_black,o_70,l_text:Arial_80_bold_center:${cleanHook}/` +
      `fl_layer_apply,g_south,y_150/` +
      `${pexelsVerticalUrl}`;

    return { bloggerImage, pinterestImage };
  } catch (error) {
    console.error(`❌ Image Service Error: ${error.message}`);
    const fallback = "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";
    return { bloggerImage: fallback, pinterestImage: fallback };
  }
}

module.exports = { getImages };

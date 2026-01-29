const axios = require("axios");

async function getImages(imagePrompt, pinHook) {
  try {
    // 1. Fetch Horizontal Image for Blogger
    const horizontalResponse = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(imagePrompt)}&orientation=landscape&per_page=1`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );

    // 2. Fetch Vertical Image for Pinterest
    const verticalResponse = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(imagePrompt)}&orientation=portrait&per_page=1`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );

    const bloggerImage = horizontalResponse.data.photos[0]?.src?.large2x || "";
    const pexelsVerticalUrl = verticalResponse.data.photos[0]?.src?.large2x || "";
    
    const cleanHook = encodeURIComponent(pinHook.replace(/[^a-zA-Z0-9 ]/g, ''));
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    // 3. Pinterest Image with AI-driven placement (g_auto)
    // We remove the fixed 'g_south' and use 'g_auto' so Cloudinary finds the "dead space"
    const pinterestImage = `https://res.cloudinary.com/${cloudName}/image/fetch/` +
      `w_1000,h_500,c_fill,b_black,o_60,l_text:Verdana_80_bold_center:${cleanHook}/` +
      `fl_layer_apply,g_auto/` + // <--- This finds the "perfect" place automatically
      `${pexelsVerticalUrl}`;

    console.log("✅ AI-positioned images prepared.");
    return { bloggerImage, pinterestImage };

  } catch (error) {
    console.error(`❌ Image Service Error: ${error.message}`);
    const fallback = "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";
    return { bloggerImage: fallback, pinterestImage: fallback };
  }
}

module.exports = { getImages };

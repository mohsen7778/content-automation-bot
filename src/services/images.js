const axios = require("axios");

async function getImages(imagePrompt, pinHook) {
  try {
    // 1. Fetch Horizontal Image for Blogger (1200x630)
    console.log(`🎨 Fetching Horizontal Image for Blogger...`);
    const horizontalResponse = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(imagePrompt)}&orientation=landscape&per_page=1`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );

    // 2. Fetch Vertical Image for Pinterest (1000x1500)
    console.log(`🎨 Fetching Vertical Image for Pinterest...`);
    const verticalResponse = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(imagePrompt)}&orientation=portrait&per_page=1`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );

    const bloggerImage = horizontalResponse.data.photos[0]?.src?.large2x || "";
    const pexelsVerticalUrl = verticalResponse.data.photos[0]?.src?.large2x || "";
    
    // Clean hook for the overlay
    const cleanHook = encodeURIComponent(pinHook.replace(/[^a-zA-Z0-9 ]/g, ''));

    // We still use Cloudinary ONLY for the text overlay on the vertical image.
    // It will not crop; it just "fetches" the vertical photo and adds the text.
    const pinterestImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/` +
      `w_1000,h_450,c_fill,b_black,o_70,g_south,l_pixel/fl_layer_apply/` +
      `co_white,g_south,y_130,w_850,c_fit,l_text:Verdana_90_bold_center:${cleanHook}/` +
      `fl_layer_apply/${pexelsVerticalUrl}`;

    return { bloggerImage, pinterestImage };
  } catch (error) {
    console.error(`❌ Image Service Error: ${error.message}`);
    const fallback = "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";
    return { bloggerImage: fallback, pinterestImage: fallback };
  }
}

module.exports = { getImages };

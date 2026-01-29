const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getImages(query, pinHook) {
  try {
    // 1. SAFETY FILTER: Sanitize the AI's query
    // Take first 3 words only and remove special characters
    const safeQuery = query.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9 ]/g, "");
    console.log(`Searching Pexels for safe query: "${safeQuery}"`);

    // 2. Get Landscape Image (for Blogger)
    const landscapeRes = await axios.get(`https://api.pexels.com/v1/search?query=${safeQuery}&orientation=landscape&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });
    
    // Fallback if no image found
    const bloggerImage = landscapeRes.data.photos[0]?.src.large2x || "https://via.placeholder.com/800x600?text=No+Image";

    // 3. Get Portrait Image (for Pinterest)
    const portraitRes = await axios.get(`https://api.pexels.com/v1/search?query=${safeQuery}&orientation=portrait&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });
    
    // Use .portrait (800x1200) for perfect quality
    const rawPinterestImage = portraitRes.data.photos[0]?.src.portrait;

    let pinterestImage = null;
    if (rawPinterestImage && pinHook) {
        const cleanHook = encodeURIComponent(pinHook.toUpperCase());
        
        // 4. Create Pinterest "Sticker" Design
        pinterestImage = cloudinary.url(rawPinterestImage, {
          type: "fetch",
          transformation: [
            { effect: "brightness_speed:-10" }, // Slight dim for contrast
            // Black Box (The Sticker)
            {
              underlay: { background: "black", opacity: 80 },
              width: "0.9", // 90% of image width
              height: 200,
              gravity: "south",
              y: 100
            },
            // Text (The Hook)
            { 
              color: "white",
              overlay: { 
                font_family: "Inter", 
                font_size: 55, 
                font_weight: "bold", 
                text: cleanHook,
                text_align: "center"
              },
              width: "0.8", // Keep text inside the box
              crop: "fit",
              gravity: "south",
              y: 160 
            }
          ]
        });
    }

    return { bloggerImage, pinterestImage: pinterestImage || bloggerImage };

  } catch (error) {
    console.error("Image Service Error:", error.message);
    // Return placeholders so the bot doesn't crash completely
    return { 
        bloggerImage: "https://via.placeholder.com/800x600?text=Error", 
        pinterestImage: "https://via.placeholder.com/800x1200?text=Error" 
    };
  }
}

module.exports = { getImages };

const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

function splitText(text, maxCharsPerLine = 20) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        if (currentLine.length + 1 + words[i].length <= maxCharsPerLine) {
            currentLine += " " + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines.join("%0A");
}

async function getImages(query, titleForOverlay) {
    try {
        console.log(`Searching Pexels for: ${query}`);
        const randomPage = Math.floor(Math.random() * 20) + 1;

        // 1. BLOGGER IMAGE: Landscape, Direct Pexels URL (No Cloudinary)
        const blogResp = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        const bloggerImage = blogResp.data.photos[0]?.src?.large || "https://images.pexels.com/photos/262508/pexels-photo-262508.jpeg";

        // 2. PINTEREST IMAGE: Vertical, Portrait
        const pinResp = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=portrait&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        const pinRawUrl = pinResp.data.photos[0]?.src?.original; // Using original to avoid quality loss

        // 3. EDIT PINTEREST IMAGE: Text Overlay Only (NO CROP)
        console.log("Creating Pinterest Design (No Crop)...");
        const upload = await cloudinary.uploader.upload(pinRawUrl, { folder: "pinterest-designs" });
        
        const cleanTitle = titleForOverlay.replace(/[:|]/g, "").split(" ").slice(0, 8).join(" "); 
        const formattedTitle = splitText(cleanTitle);

        // This creates a text overlay while maintaining the original aspect ratio
        const pinterestImage = cloudinary.url(upload.public_id, {
            transformation: [
                { effect: "brightness:-30" }, // Slight darken so text is readable
                {
                    overlay: {
                        font_family: "Arial",
                        font_size: 70,
                        font_weight: "bold",
                        text_align: "center",
                        text: formattedTitle
                    },
                    color: "#FFFFFF",
                    width: "0.8", // Text takes 80% of image width
                    crop: "fit",
                    gravity: "center"
                }
            ]
        });

        return { bloggerImage, pinterestImage };

    } catch (error) {
        console.error("Image Error:", error.message);
        return { 
            bloggerImage: "https://images.pexels.com/photos/262508/pexels-photo-262508.jpeg",
            pinterestImage: null
        };
    }
}

module.exports = { getImages };

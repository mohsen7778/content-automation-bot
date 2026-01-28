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

        // 1. GET BLOGGER IMAGE (Strict Landscape, Direct from Pexels)
        // We add &orientation=landscape to the API call
        const blogResp = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        
        // Use the 'large' version which is typically 940x650 or similar, perfect for Blogger
        // No Cloudinary transformation used here.
        const bloggerImage = blogResp.data.photos[0]?.src?.large || "https://images.pexels.com/photos/262508/pexels-photo-262508.jpeg";

        // 2. GET PINTEREST IMAGE (Strict Portrait for Telegram/Pinterest)
        const pinResp = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=portrait&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        
        const pinRawUrl = pinResp.data.photos[0]?.src?.large2x;

        // 3. EDIT PINTEREST IMAGE (Only for Telegram/Pinterest use)
        console.log("Creating Pinterest Design...");
        const upload = await cloudinary.uploader.upload(pinRawUrl, { folder: "pinterest-designs" });
        
        const cleanTitle = titleForOverlay.replace(/[:|]/g, "").split(" ").slice(0, 8).join(" "); 
        const formattedTitle = splitText(cleanTitle);

        const pinterestImage = cloudinary.url(upload.public_id, {
            transformation: [
                { width: 1000, height: 1500, crop: "fill", gravity: "auto" },
                { effect: "brightness:-40" },
                {
                    overlay: {
                        font_family: "Arial",
                        font_size: 80,
                        font_weight: "bold",
                        text_align: "center",
                        text: formattedTitle
                    },
                    color: "#FFFFFF",
                    width: 900,
                    crop: "fit"
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

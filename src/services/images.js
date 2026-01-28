const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper: split text into lines so it fits on the image
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
    return lines.join("%0A"); // Encoded newline
}

async function getImages(query, titleForOverlay) {
    try {
        console.log(`Searching Pexels for: ${query}`);
        const randomPage = Math.floor(Math.random() * 50) + 1;

        // 1. GET BLOGGER IMAGE (Horizontal, Raw, Just Resized via URL)
        const blogResp = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        
        // Add Pexels resize parameters for 1200x630
        const rawUrl = blogResp.data.photos[0]?.src?.original;
        const bloggerImage = `${rawUrl}?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop`;

        // 2. GET PINTEREST IMAGE (Vertical, for editing)
        const pinResp = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=portrait&page=${randomPage}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY }
        });
        
        const pinRawUrl = pinResp.data.photos[0]?.src?.large2x;

        // 3. EDIT PINTEREST IMAGE IN CLOUDINARY (Text Overlay)
        console.log("Creating Pinterest Design...");
        const upload = await cloudinary.uploader.upload(pinRawUrl, { folder: "pinterest-designs" });
        
        // Clean the title for the overlay (shorten if needed)
        const cleanTitle = titleForOverlay.replace(/[:|]/g, "").split(" ").slice(0, 8).join(" "); 
        const formattedTitle = splitText(cleanTitle);

        const pinterestImage = cloudinary.url(upload.public_id, {
            transformation: [
                { width: 1000, height: 1500, crop: "fill", gravity: "auto" }, // Vertical Crop
                { effect: "brightness:-40" }, // Darken slightly so text pops
                {
                    overlay: {
                        font_family: "Arial",
                        font_size: 80,
                        font_weight: "bold",
                        text_align: "center",
                        text: formattedTitle
                    },
                    color: "#FFFFFF",
                    width: 900, // Text box width
                    crop: "fit"
                }
            ]
        });

        return { bloggerImage, pinterestImage };

    } catch (error) {
        console.error("Image Error:", error.message);
        return { 
            bloggerImage: "https://images.pexels.com/photos/262508/pexels-photo-262508.jpeg?w=1200&h=630&fit=crop",
            pinterestImage: null
        };
    }
}

module.exports = { getImages };

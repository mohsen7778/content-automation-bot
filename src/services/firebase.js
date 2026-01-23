const fs = require('fs');
const path = require('path');

async function uploadFile(tempFilePath) {
    try {
        // 1. Create a "public" folder if it doesn't exist
        const publicDir = path.join(__dirname, '../../public/images');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        // 2. Move the image from temp to public/images
        const fileName = `${Date.now()}.png`;
        const newPath = path.join(publicDir, fileName);
        fs.renameSync(tempFilePath, newPath);

        // 3. Create the GitHub URL
        // Replace 'mohsen7778' and 'content-automation-bot' if your names are different
        const username = "mohsen7778"; 
        const repo = "content-automation-bot";
        const publicUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/public/images/${fileName}`;

        console.log("Image saved to GitHub: " + publicUrl);
        return publicUrl;
    } catch (error) {
        console.error("Storage Error:", error.message);
        throw error;
    }
}

module.exports = { uploadFile };

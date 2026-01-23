const fs = require('fs');
const path = require('path');

async function uploadFile(tempFilePath) {
    try {
        const publicDir = path.join(__dirname, '../../public/images');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const fileName = `${Date.now()}.png`;
        const newPath = path.join(publicDir, fileName);
        
        // This moves the file from temp to the public folder
        fs.copyFileSync(tempFilePath, newPath);

        const username = "mohsen7778"; 
        const repo = "content-automation-bot";
        const publicUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/public/images/${fileName}`;

        return publicUrl;
    } catch (error) {
        console.error("Storage Error:", error.message);
        throw error;
    }
}

module.exports = { uploadFile };

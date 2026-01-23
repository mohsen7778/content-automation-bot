const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createBlogImage(title) {
    // 1. Get a random image from Unsplash (Topic: Tech/Nature)
    const imageUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop`; 
    // Note: In the future, we can make this keyword dynamic!
    
    const image = await loadImage(imageUrl);

    // 2. Create a canvas (The size of a standard Facebook/Blogger header)
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // 3. Draw the background photo
    ctx.drawImage(image, 0, 0, 1200, 630);

    // 4. Add a dark overlay (so text is easy to read)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 1200, 630);

    // 5. Add the Title Text
    ctx.fillStyle = '#ffffff'; // White text
    ctx.font = 'bold 50pt Arial';
    ctx.textAlign = 'center';
    
    // This wraps the text if it's too long
    const words = title.split(' ');
    let line = '';
    let y = 300;
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (testLine.length > 30) {
            ctx.fillText(line, 600, y);
            line = words[n] + ' ';
            y += 80;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 600, y);

    // 6. Save the file to the "temp" folder
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const filePath = path.join(tempDir, 'post-image.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    return filePath; // Return the local path to the boss
}

module.exports = { createBlogImage };

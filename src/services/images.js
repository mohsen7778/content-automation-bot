const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function createBlogImage(title) {
    // 1. Fetch a random background
    const image = await loadImage('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop');
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, 1200, 630);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50pt Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, 600, 315);

    // 2. Convert the image to a Base64 String (Text that looks like an image)
    const base64Image = canvas.toDataURL('image/png');
    
    // 3. Still save a local copy for Telegram
    const filePath = './temp-post.png';
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    return { filePath, base64Image };
}

module.exports = { createBlogImage };

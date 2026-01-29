require('dotenv').config();
const { getTopic } = require('./src/services/topics');
const { generateContent } = require('./src/services/gemini');
const { postToBlogger } = require('./src/services/blogger');
const { getImages } = require('./src/services/pexels');
const { generatePinUrl } = require('./src/services/images');

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Helper: Escape Markdown for Telegram (Prevents crashes)
const escapeMarkdown = (text) => {
    if (!text) return "";
    return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
};

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);

    // 1. Find Image
    console.log(`📷 Searching Pexels for: ${content.imagePrompt}...`);
    const rawImageUrl = await getImages(content.imagePrompt);
    if (!rawImageUrl) throw new Error("No image found on Pexels");

    // 2. Generate Cloudinary Versions
    // Note: We used 'Roboto' in images.js to be safe.
    const bloggerImage = generatePinUrl(rawImageUrl, "", "dark", "Inter"); 
    const pinterestImage = generatePinUrl(rawImageUrl, content.pinHook, "dark", "Inter");

    // 3. Inject Clean Image into Blogger Body
    const bodyWithImage = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${bloggerImage}" style="max-width: 100%; border-radius: 10px;" />
        </div>
        ${content.body}
    `;

    const blogUrl = await postToBlogger({
        ...content,
        body: bodyWithImage,
        featuredImage: bloggerImage
    });

    console.log(`✅ Blog live: ${blogUrl}`);

    // 4. Telegram Notification
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const tempPath = path.resolve(__dirname, 'temp_pin.jpg');

      console.log("📱 Downloading Pinterest image...");

      try {
        // Request the image as a stream
        const response = await axios({ 
            url: pinterestImage, 
            method: 'GET', 
            responseType: 'stream' 
        });

        // Save to disk
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Send to Telegram
        const safeTitle = escapeMarkdown(content.title);
        const safeHook = escapeMarkdown(content.pinHook);
        const caption = `📝 *New Post:* ${safeTitle}\n\n📌 *Pin:* ${safeHook}\n\n🔗 [Read More](${blogUrl})`;

        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', fs.createReadStream(tempPath));
        form.append('caption', caption);
        form.append('parse_mode', 'MarkdownV2');

        await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, form, {
          headers: { ...form.getHeaders() }
        });

        console.log("✅ Telegram Notification Sent!");

      } catch (telegramErr) {
        // CUSTOM ERROR HANDLER FOR IMAGES
        // If downloading the image fails, the error body is a stream.
        // We must avoid printing the whole stream object.
        let msg = telegramErr.message;
        
        if (telegramErr.response && telegramErr.response.data) {
             // If it's a Cloudinary error (400), it sends details in the headers usually
             if (telegramErr.response.headers['x-cld-error']) {
                 msg = `Cloudinary Error: ${telegramErr.response.headers['x-cld-error']}`;
             } else {
                 msg = `API Status: ${telegramErr.response.status}`;
             }
        }
        console.error("⚠️ Telegram/Image Error:", msg);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }

  } catch (error) {
    // MAIN ERROR HANDLER
    // Only prints the message strings, never the full object
    console.error("❌ Bot failed:", error.message);
    process.exit(1);
  }
}

runBot();

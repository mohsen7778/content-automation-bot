// index.js
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

// Helper to prevent Telegram crashes
const escapeMarkdown = (text) => {
    if (!text) return "";
    return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
};

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);

    // 1. Find BOTH Images (Landscape & Portrait)
    console.log(`📷 Searching Pexels for: ${content.imagePrompt}...`);
    const { landscapeUrl, portraitUrl } = await getImages(content.imagePrompt);

    // Ensure we have both before proceeding
    if (!landscapeUrl) throw new Error("Failed to find a landscape image for Blogger.");
    if (!portraitUrl) throw new Error("Failed to find a portrait image for Telegram.");


    // 2. Assign Images
    // Blogger = Raw Horizontal Image
    const bloggerImage = landscapeUrl;

    // Pinterest/Telegram = Edited Vertical Image
    const pinterestImage = generatePinUrl(portraitUrl, content.pinHook, "dark", "Inter");


    // 3. Post to Blogger (Using Raw Horizontal Image)
    const bodyWithImage = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${bloggerImage}" style="max-width: 100%; border-radius: 10px;" alt="${content.title}" />
        </div>
        ${content.body}
    `;

    const blogUrl = await postToBlogger({
        ...content,
        body: bodyWithImage,
        featuredImage: bloggerImage
    });

    console.log(`✅ Blog live: ${blogUrl}`);

    // 4. Telegram Notification (Using Edited Vertical Image)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const tempPath = path.resolve(__dirname, 'temp_pin.jpg');

      console.log("📱 Downloading Pinterest image for Telegram...");

      try {
        // Download the Cloudinary-edited image
        const response = await axios({
            url: pinterestImage,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

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
        console.error("⚠️ Telegram Error:", telegramErr.message);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }

  } catch (error) {
    console.error("❌ Bot failed:", error.message);
    process.exit(1);
  }
}

runBot();

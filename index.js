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

// FIX: Improved Regex to strictly catch hyphens (-) and special chars for Telegram MarkdownV2
const escapeMarkdown = (text) => {
    if (!text) return "";
    // The hyphen (-) is now escaped as \- inside the brackets to prevent "range" errors
    return text.replace(/([_*[\]()~`>#\+\-=|{}.!])/g, '\\$1');
};

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);

    // 1. Find BOTH Images (Landscape & Portrait)
    console.log(`📷 Searching Pexels for: ${content.imagePrompt}...`);
    const { landscapeUrl, portraitUrl } = await getImages(content.imagePrompt);

    // 2. Assign Images
    // Blogger = Raw Horizontal Image (No Cloudinary editing)
    const bloggerImage = landscapeUrl;
    
    // Pinterest/Telegram = Edited Vertical Image (With Cloudinary Text)
    const pinterestImage = generatePinUrl(portraitUrl, content.pinHook, "dark", "Inter");

    // 3. Post to Blogger
    // We pass the RAW landscape image. We do NOT inject an <img> tag manually.
    const blogUrl = await postToBlogger({
        ...content,
        body: content.body, 
        featuredImage: bloggerImage 
    });

    console.log(`✅ Blog live: ${blogUrl}`);

    // 4. Telegram Notification
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const tempPath = path.resolve(__dirname, 'temp_pin.jpg');

      console.log("📱 Downloading Pinterest image for Telegram...");

      try {
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

        // Apply the FIXED escape function to Title and Hook
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

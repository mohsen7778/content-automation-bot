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

// Helper to prevent Telegram 400 errors by escaping special Markdown characters
const escapeMarkdown = (text) => {
    return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
};

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);

    // 1. Find Image
    const rawImageUrl = await getImages(content.imagePrompt);
    if (!rawImageUrl) throw new Error("No image found on Pexels");

    // 2. Generate Cloudinary Versions
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

    // 4. Telegram Notification (Photo + Caption)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const tempPath = path.resolve(__dirname, 'temp_pin.jpg');

      // Download styled Pinterest image
      const response = await axios({ url: pinterestImage, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Prepare safe MarkdownV2 caption
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

      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      console.log("✅ Telegram Notification Sent!");
    }

  } catch (error) {
    console.error("❌ Bot failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

runBot();

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

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);

    // 1. Get the raw image from Pexels
    const rawImageUrl = await getImages(content.imagePrompt);
    if (!rawImageUrl) throw new Error("No image found on Pexels.");

    // 2. Generate the edited Pinterest version for Telegram
    const pinterestImage = generatePinUrl(rawImageUrl, content.pinHook, "dark", "Inter");

    // 3. Prepare Blogger Body (Using raw Pexels image, no Cloudinary)
    const blogBodyWithImage = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${rawImageUrl}" style="max-width: 100%; height: auto; border-radius: 8px;" />
        </div>
        ${content.body}
    `;

    const blogUrl = await postToBlogger({
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: blogBodyWithImage,
        featuredImage: rawImageUrl // Raw link for metadata
    });

    console.log(`✅ Blog live: ${blogUrl}`);

    // 4. Send Telegram Notification (Image + Text in ONE message)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const tempPath = path.resolve(__dirname, 'temp_pin.jpg');

      try {
        // Download the EDITED Pinterest version
        const response = await axios({ url: pinterestImage, method: 'GET', responseType: 'stream' });
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);
        await new Promise((res, rej) => { writer.on('finish', res); writer.on('error', rej); });

        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', fs.createReadStream(tempPath), { filename: 'pin.jpg' });
        
        // Caption contains the blog link and the hook
        const captionText = `📝 *New Post:* "${content.title}"\n\n📌 *Pinterest:* ${content.pinHook}\n\n🔗 [Read Full Blog Here](${blogUrl})`;
        form.append('caption', captionText);
        form.append('parse_mode', 'Markdown');

        await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, form, {
          headers: { ...form.getHeaders() }
        });

        console.log("✅ Telegram Notification Sent!");
      } catch (err) {
        console.error("⚠️ Telegram failed:", err.message);
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

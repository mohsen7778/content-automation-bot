require('dotenv').config();
const { getTopic } = require('./src/services/topics');
const { generateContent } = require('./src/services/gemini');
const { postToBlogger } = require('./src/services/blogger');
// NEW IMPORTS
const { getImages } = require('./src/services/pexels'); // The Searcher
const { generatePinUrl } = require('./src/services/images'); // The Editor

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    // 1. Generate text content using Gemini
    const content = await generateContent(topic);

    // 2. FIND the image on Pexels (using the AI's image prompt)
    console.log(`📷 Searching Pexels for: ${content.imagePrompt}...`);
    const rawImageUrl = await getImages(content.imagePrompt);

    if (!rawImageUrl) {
        throw new Error("Could not find a suitable image on Pexels.");
    }

    // 3. EDIT the image for Blogger (Clean/No Text) and Pinterest (Pro Design)
    // For Blogger: We just use Cloudinary to resize/crop it nicely without text
    const bloggerImage = generatePinUrl(rawImageUrl, "", "dark", "Inter"); 
    
    // For Pinterest: We add the AI-generated Hook and the Pro Design
    const pinterestImage = generatePinUrl(rawImageUrl, content.pinHook, "dark", "Inter");

    // 4. Post to Blogger
    const blogUrl = await postToBlogger({
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: content.body,
        featuredImage: bloggerImage
    });

    console.log(`✅ Success! Blog live: ${blogUrl}`);

    // 5. Telegram Notifications
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: `📝 *New Post:* "${content.title}" \n\n🔗 [Read Here](${blogUrl})`,
        parse_mode: 'Markdown'
      });

      console.log("📱 Uploading Pinterest Pin to Telegram...");
      const tempPath = path.resolve(__dirname, 'temp_pin.jpg');

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

        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', fs.createReadStream(tempPath), { filename: 'pin.jpg' });
        form.append('caption', `📌 Pinterest Ready Pin: ${content.pinHook}`);

        await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, form, {
          headers: { ...form.getHeaders() }
        });

        console.log("✅ Telegram Notification Complete!");
      } catch (err) {
        console.error("⚠️ Photo upload failed:", err.response?.data || err.message);
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

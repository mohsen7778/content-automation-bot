const { getTopic } = require('./src/services/topics');
const { generateContent } = require('./src/services/gemini');
const { postToBlogger } = require('./src/services/blogger');
const { getImages } = require('./src/services/images');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.pinHook);

    const blogUrl = await postToBlogger({
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: content.body,
        featuredImage: bloggerImage
    });

    console.log(`✅ Success! Blog live: ${blogUrl}`);

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      // 1. Send link
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: `📝 *New Post:* "${content.title}" \n\n🔗 [Read Here](${blogUrl})`,
        parse_mode: 'Markdown'
      });

      console.log("📱 Downloading and uploading Pinterest image...");
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
        form.append('caption', `📌 Pinterest: ${content.pinHook}`);

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

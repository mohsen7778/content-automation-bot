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
    
    // Fetch both Landscape and AI-positioned Portrait images
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.pinHook);

    const blogUrl = await postToBlogger({
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: content.body,
        featuredImage: bloggerImage // The horizontal one
    });

    console.log(`✅ Success! Blog live: ${blogUrl}`);

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      console.log("📱 Uploading AI-positioned Image to Telegram...");
      
      // Send Link Message
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `📝 *New Post:* "${content.title}" \n\n🔗 [Read Here](${blogUrl})`,
        parse_mode: 'Markdown'
      });

      // Download and Upload the Pinterest version as a file to Telegram
      const tempPath = path.join(__dirname, 'temp_pin.jpg');
      const response = await axios({ url: pinterestImage, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const form = new FormData();
      form.append('chat_id', process.env.TELEGRAM_CHAT_ID);
      form.append('photo', fs.createReadStream(tempPath));
      form.append('caption', `📌 Pinterest: ${content.pinHook}`);

      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
        headers: form.getHeaders()
      });

      console.log("✅ Telegram Notification Complete!");
      fs.unlinkSync(tempPath); 
    }

  } catch (error) {
    console.error("❌ Bot failed:", error.message);
    process.exit(1);
  }
}

runBot();

const { getTopic } = require('./src/services/topics');
const { generateContent } = require('./src/services/gemini');
const { postToBlogger } = require('./src/services/blogger');
const { getImages } = require('./src/services/images');
const axios = require('axios');

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);
    
    // Pass pinHook for the "Sticker" design
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.pinHook);

    const blogData = {
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: content.body,
        featuredImage: bloggerImage
    };

    const blogUrl = await postToBlogger(blogData);
    console.log(`✅ Post live: ${blogUrl}`);

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const message = `📝 *New Post Published!* \n"${content.title}" \n\n🔗 [Read Online](${blogUrl})`;
      
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });

      if (pinterestImage) {
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            photo: pinterestImage,
            caption: `📌 Pinterest Design Ready: ${content.pinHook}`
          });
      }
    }

  } catch (error) {
    console.error("❌ Bot failed:", error.message);
    process.exit(1);
  }
}

runBot();

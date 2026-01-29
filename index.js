const { getTopic } = require('./src/services/topics');
const { generateContent } = require('./src/services/gemini');
const { postToBlogger } = require('./src/services/blogger');
const { getImages } = require('./src/services/images');
const axios = require('axios');

async function runBot() {
  try {
    // 1. Get Topic from your topics.js list
    const topic = getTopic();
    console.log(`Running Topic: ${topic}`);

    // 2. Generate Text (Now expects 7 sections including pinHook)
    const content = await generateContent(topic);
    
    // 3. Get Images
    // Passes the punchy hook to Cloudinary for the Pinterest design
    console.log(`Generating images for: ${content.imagePrompt}`);
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.pinHook);

    // 4. Post to Blogger
    const blogData = {
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: content.body,
        featuredImage: bloggerImage
    };

    console.log("Posting to Blogger...");
    const blogUrl = await postToBlogger(blogData);
    console.log(`Success! Post live at: ${blogUrl}`);

    // 5. Send Notification to Telegram
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      
      // Text notification with link
      const message = `📝 *New Post Published!*\n"${content.title}"\n\n🔗 [Read Online](${blogUrl})`;
      
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });

      // Send the Edited Pinterest Image as a separate photo
      if (pinterestImage) {
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            photo: pinterestImage,
            caption: `📌 Pinterest Design: ${content.pinHook}`
          });
      }
      
      console.log("Telegram notification sent!");
    }

  } catch (error) {
    console.error("Bot failed:", error.message);
    process.exit(1);
  }
}

runBot();

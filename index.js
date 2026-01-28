const { getTopic } = require('./src/services/topics');
const { generateContent } = require('./src/services/gemini');
const { postToBlogger } = require('./src/services/blogger');
const { getImages } = require('./src/services/images');
const axios = require('axios');

async function runBot() {
  try {
    // 1. Get Topic
    const topic = getTopic();
    console.log(`Running Topic: ${topic}`);

    // 2. Generate Text
    console.log("Gemini is composing...");
    const content = await generateContent(topic);
    
    // 3. Get Images (Both Blog & Pinterest versions)
    // We pass the generated Title to the image service for the overlay
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.title);

    // 4. Post to Blogger (Using the simple Pexels link)
    console.log("Posting to Blogger...");
    const blogUrl = await postToBlogger(content.title, content.htmlContent, bloggerImage);
    console.log(`Success! Post live at: ${blogUrl}`);

    // 5. Send Notification to Telegram (Send the Pinterest Design)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const message = `
📝 *New Blog Post Created!*
"${content.title}"

🔗 [Read Online](${blogUrl})

🎨 *Pinterest Design Preview:*
(See image below)
      `;
      
      // Send text
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });

      // Send the Edited Pinterest Image
      if (pinterestImage) {
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            photo: pinterestImage,
            caption: "📌 Pinterest Design Ready"
          });
      }
      
      console.log("Telegram notification sent!");
    }

  } catch (error) {
    console.error("Bot failed:", error);
    process.exit(1);
  }
}

runBot();

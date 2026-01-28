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

    // 2. Generate Text (Category, Intro, Quote, Body, etc.)
    const content = await generateContent(topic);
    
    // 3. Get Images
    // Returns { bloggerImage (clean), pinterestImage (edited) }
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.title);

    // 4. Post to Blogger
    // We construct the "blogData" object exactly as your file expects
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
      const message = `
📝 *New Post Published!*
"${content.title}"

🔗 [Read Online](${blogUrl})
      `;
      
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

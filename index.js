const { getTopic } = require('./src/services/topics');
const { generateContent } = require('./src/services/gemini');
const { postToBlogger } = require('./src/services/blogger');
const { getImages } = require('./src/services/images');
const axios = require('axios');

async function runBot() {
  try {
    console.log("🚀 Bot Starting...");

    // 1. Get Topic
    const topic = getTopic();
    if (!topic) {
      throw new Error("No topic returned from getTopic()");
    }
    console.log(`📝 Running Topic: ${topic}`);

    // 2. Generate Content (Using Hugging Face / Mistral)
    // This now returns 7 parts, including the pinHook for the image
    const content = await generateContent(topic);
    
    // 3. Get Images
    // We pass the 'imagePrompt' for searching and 'pinHook' for the sticker text
    console.log(`🎨 Generating images for: "${content.imagePrompt}" with hook: "${content.pinHook}"`);
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.pinHook);

    // 4. Post to Blogger
    const blogData = {
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: content.body,
        featuredImage: bloggerImage // Use the clean landscape photo for the blog
    };

    console.log("📤 Posting to Blogger...");
    const blogUrl = await postToBlogger(blogData);
    console.log(`✅ Success! Post live at: ${blogUrl}`);

    // 5. Send Notification to Telegram
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      
      // Message 1: The Blog Post Link
      const message = `
📝 *New Short Blog Published!*
"${content.title}"

🔗 [Read Online](${blogUrl})
      `;
      
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });

      // Message 2: The Pinterest "Sticker" Image
      // We send this separately so you can easily save it to your phone
      if (pinterestImage) {
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            photo: pinterestImage,
            caption: `📌 Pinterest Design: ${content.pinHook}`
          });
      }
      
      console.log("📱 Telegram notification sent!");
    }

  } catch (error) {
    console.error("❌ Bot failed:", error.message);
    process.exit(1); // Exit with error so GitHub Actions marks it as failed
  }
}

runBot();

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
    
    console.log(`🎨 Fetching images for: ${content.imagePrompt}`);
    const { bloggerImage, pinterestImage } = await getImages(content.imagePrompt, content.pinHook);

    const blogData = {
        category: content.category,
        title: content.title,
        intro: content.intro,
        quote: content.quote,
        body: content.body,
        featuredImage: bloggerImage
    };

    console.log("📤 Posting to Blogger...");
    const blogUrl = await postToBlogger(blogData);
    console.log(`✅ Success! ${blogUrl}`);

    // --- TELEGRAM NOTIFICATION SECTION ---
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const message = `📝 *New Post:* "${content.title}" \n\n🔗 [Link](${blogUrl})`;
        
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        });

        if (pinterestImage) {
            console.log("📱 Sending Pinterest Image to Telegram...");
            // Use a try-catch specifically for the photo in case the URL is too long
            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
              chat_id: process.env.TELEGRAM_CHAT_ID,
              photo: pinterestImage,
              caption: `📌 Pinterest: ${content.pinHook}`
            }).catch(async (err) => {
                console.warn("⚠️ Complex image failed for Telegram, sending clean image instead.");
                // Fallback: Send the clean Pexels image if the Cloudinary one is too complex
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                  chat_id: process.env.TELEGRAM_CHAT_ID,
                  photo: bloggerImage,
                  caption: `📌 Pinterest: ${content.pinHook} (Clean Version)`
                });
            });
        }
      } catch (tgError) {
        console.error("⚠️ Telegram Notification failed, but Blog is live:", tgError.message);
      }
    }

  } catch (error) {
    console.error("❌ Bot failed:", error.message);
    process.exit(1);
  }
}

runBot();

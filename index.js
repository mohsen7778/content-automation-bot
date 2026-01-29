// index.js (Debug Version)
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

// Helper: Escape Markdown for Telegram
const escapeMarkdown = (text) => {
    if (!text) return "";
    return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
};

async function runBot() {
  try {
    const topic = getTopic();
    console.log(`🚀 Starting Bot | Topic: ${topic}`);

    const content = await generateContent(topic);

    // 1. Find Image
    console.log(`📷 Searching Pexels for: ${content.imagePrompt}...`);
    const rawImageUrl = await getImages(content.imagePrompt);
    if (!rawImageUrl) throw new Error("No image found on Pexels");

    // 2. Generate Cloudinary Versions
    // We pass 'Inter', but images.js will safely convert it to 'Roboto'
    const bloggerImage = generatePinUrl(rawImageUrl, "", "dark", "Inter"); 
    const pinterestImage = generatePinUrl(rawImageUrl, content.pinHook, "dark", "Inter");

    // --- DEBUG: Print the URL ---
    console.log("\n---------------------------------------------------");
    console.log("🔎 DEBUG: Generated Blogger Image URL:");
    console.log(bloggerImage);
    console.log("👉 Copy this URL and try to open it in your browser.");
    console.log("---------------------------------------------------\n");
    // ----------------------------

    // 3. Inject Clean Image into Blogger Body
    const bodyWithImage = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${bloggerImage}" style="max-width: 100%; border-radius: 10px;" alt="${content.title}" />
        </div>
        ${content.body}
    `;

    const blogUrl = await postToBlogger({
        ...content,
        body: bodyWithImage,
        featuredImage: bloggerImage
    });

    console.log(`✅ Blog live: ${blogUrl}`);

    // 4. Telegram Notification
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      // ... (Telegram logic remains the same) ...
    }

  } catch (error) {
    console.error("❌ Bot failed:", error.message);
    process.exit(1);
  }
}

runBot();

const axios = require('axios');

async function sendMessage(text, imageUrl) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const baseUrl = `https://api.telegram.org/bot${token}`;

  try {
    // 1. Send the photo with the caption
    await axios.post(`${baseUrl}/sendPhoto`, {
      chat_id: chatId,
      photo: imageUrl,
      caption: text,
      parse_mode: 'HTML'
    });
    
    console.log("Telegram notification sent!");
  } catch (error) {
    console.error("Telegram failed:", error.response?.data || error.message);
    
    // Fallback: If photo fails, just try sending the text
    await axios.post(`${baseUrl}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
  }
}

module.exports = { sendMessage };

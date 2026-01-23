const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const baseUrl = `https://api.telegram.org/bot${token}`;

// NEW: This function checks if you sent /post or clicked the button
async function checkForTrigger() {
  const response = await axios.get(`${baseUrl}/getUpdates`);
  const messages = response.data.result;

  // Look through the last few messages
  for (const msg of messages) {
    if (msg.message && msg.message.text) {
      const text = msg.message.text;
      // If we find the trigger, we return true
      if (text === '/post' || text === '🚀 Post Now') {
        return true;
      }
    }
  }
  return false;
}

async function sendMessage(text, imageUrl) {
  const keyboard = {
    keyboard: [[{ text: "🚀 Post Now" }]],
    resize_keyboard: true
  };

  try {
    await axios.post(`${baseUrl}/sendPhoto`, {
      chat_id: chatId,
      photo: imageUrl,
      caption: text,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(keyboard)
    });
  } catch (error) {
    await axios.post(`${baseUrl}/sendMessage`, {
      chat_id: chatId,
      text: text,
      reply_markup: JSON.stringify(keyboard)
    });
  }
}

module.exports = { sendMessage, checkForTrigger };

const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const baseUrl = `https://api.telegram.org/bot${token}`;

async function checkForTrigger() {
  try {
    const response = await axios.get(`${baseUrl}/getUpdates`);
    const messages = response.data.result;

    if (messages.length === 0) {
        console.log("No new messages found in Telegram.");
        return false;
    }

    // Look at the very last message sent to the bot
    const lastMessage = messages[messages.length - 1];
    const text = lastMessage.message?.text;

    console.log(`Last message received: "${text}"`);

    if (text === '/post' || text === '🚀 Post Now') {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Telegram Check Error:", err.message);
    return false;
  }
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

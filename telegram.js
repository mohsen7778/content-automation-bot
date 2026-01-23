const axios = require('axios');

async function sendMessage(text, imageUrl) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const baseUrl = `https://api.telegram.org/bot${token}`;

  // This creates the big button at the bottom of your screen
  const keyboard = {
    keyboard: [
      [{ text: "🚀 Post Now" }]
    ],
    resize_keyboard: true, // makes the button smaller/neat
    one_time_keyboard: false // keeps the button there
  };

  try {
    // Send photo + the button
    await axios.post(`${baseUrl}/sendPhoto`, {
      chat_id: chatId,
      photo: imageUrl,
      caption: text,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(keyboard) // This attaches the button
    });
    
  } catch (error) {
    // If photo fails, send text + the button
    await axios.post(`${baseUrl}/sendMessage`, {
      chat_id: chatId,
      text: text,
      reply_markup: JSON.stringify(keyboard)
    });
  }
}

module.exports = { sendMessage };

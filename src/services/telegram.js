const axios = require('axios');

async function sendToTelegram(title, postUrl, imageUrl) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    // This creates a nice caption with the title and a clickable link
    const caption = `✨ *New Post Live on Notes from Mia* ✨\n\n*${title}*\n\n📖 Read more here: ${postUrl}`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
            chat_id: chatId,
            photo: imageUrl,
            caption: caption,
            parse_mode: 'Markdown'
        });
        console.log("Telegram notification sent!");
    } catch (error) {
        console.error("Telegram Error:", error.response ? error.response.data : error.message);
    }
}

module.exports = { sendToTelegram };

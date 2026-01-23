const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const baseUrl = `https://api.telegram.org/bot${token}`;

async function checkForTrigger() {
    const res = await axios.get(`${baseUrl}/getUpdates`);
    const msg = res.data.result.pop();
    return msg?.message?.text === '/post' || msg?.message?.text === '🚀 Post Now';
}

async function sendLocalPhoto(caption, filePath) {
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption);
    form.append('photo', fs.createReadStream(filePath));
    
    await axios.post(`${baseUrl}/sendPhoto`, form, {
        headers: form.getHeaders()
    });
}

module.exports = { checkForTrigger, sendLocalPhoto };

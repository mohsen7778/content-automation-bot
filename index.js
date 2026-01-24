require('dotenv').config();
// We point to gemini.js because that's what your file is named
const { generateBlogPost } = require('./src/services/gemini'); 
const { postToBlogger } = require('./src/services/blogger');

async function runBot() {
    try {
        console.log("1. Starting Gemini 2.5 Flash Engine...");
        const blogData = await generateBlogPost();

        console.log("2. Sending to Blogger with curated Mia template...");
        const postUrl = await postToBlogger(blogData);

        console.log("Success! Post live at:", postUrl);
    } catch (error) {
        console.error("Bot failed:", error);
        process.exit(1);
    }
}

runBot();

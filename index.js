require('dotenv').config();
const { generateBlogData } = require('./src/services/ai'); 
const { getPexelsImage } = require('./src/services/pexels');
const { postToBlogger } = require('./src/services/blogger');

async function runBot() {
    try {
        console.log("1. Generating AI Content...");
        const blogData = await generateBlogData();

        console.log(`2. Fetching fresh image for: ${blogData.category || 'nature'}...`);
        const imageUrl = await getPexelsImage(blogData.category || blogData.title);

        console.log("3. Posting to Blogger...");
        const postUrl = await postToBlogger(blogData, imageUrl);

        console.log("Success! Post live at:", postUrl);
    } catch (error) {
        console.error("Bot failed:", error);
        process.exit(1);
    }
}

runBot();

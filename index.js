// index.js
require('dotenv').config();
const { generateContent } = require('./src/services/ai'); // Assuming your AI file has this function
const { getPexelsImage } = require('./src/services/pexels');
const { postToBlogger } = require('./src/services/blogger');

async function runBot() {
    try {
        console.log("Step 1: Generating content with AI...");
        // This should return { title, category, intro, body, quote }
        const blogData = await generateContent(); 

        console.log(`Step 2: Searching Pexels for: ${blogData.category}...`);
        // We use the category (e.g., 'Fitness' or 'Recipe') to find the image
        const freshImageUrl = await getPexelsImage(blogData.category);

        console.log("Step 3: Posting to Blogger...");
        const postUrl = await postToBlogger(blogData, freshImageUrl);

        console.log("Done! Post created successfully at:", postUrl);
    } catch (error) {
        console.error("Bot failed at some point:", error);
    }
}

runBot();

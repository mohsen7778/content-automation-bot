// This is the "Boss" script
const gemini = require('./src/services/gemini');
const images = require('./src/services/images');
const firebase = require('./src/services/firebase');
const blogger = require('./src/services/blogger');
const telegram = require('./src/services/telegram');

async function startWorkflow() {
    try {
        console.log("1. Generating content with Gemini...");
        const blogData = await gemini.generateBlogPost();

        console.log("2. Creating image with text overlay...");
        const imagePath = await images.createBlogImage(blogData.title);

        console.log("3. Uploading to Firebase...");
        const imageUrl = await firebase.uploadFile(imagePath);

        console.log("4. Posting to Blogger...");
        const blogLink = await blogger.postToBlogger(blogData.title, blogData.content, imageUrl);

        console.log("5. Sending Telegram notification...");
        await telegram.sendMessage(`Done! \n\nLink: ${blogLink}`, imageUrl);

        console.log("Workflow Complete!");
    } catch (error) {
        console.error("Workflow failed:", error);
    }
}

// Execute the workflow
startWorkflow();

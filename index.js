const gemini = require('./src/services/gemini');
const images = require('./src/services/images');
const firebase = require('./src/services/firebase');
const blogger = require('./src/services/blogger');
const telegram = require('./src/services/telegram');

async function startWorkflow() {
    try {
        console.log("Checking Telegram for triggers...");
        const shouldStart = await telegram.checkForTrigger();

        if (!shouldStart) {
            console.log("No trigger found. Sleeping...");
            return; // STOP the script here if no one pressed the button
        }

        console.log("Trigger found! Starting automation...");
        
        const blogData = await gemini.generateBlogPost();
        const imagePath = await images.createBlogImage(blogData.title);
        const imageUrl = await firebase.uploadFile(imagePath);
        const blogLink = await blogger.postToBlogger(blogData.title, blogData.content, imageUrl);

        await telegram.sendMessage(`<b>New Post Published!</b>\n\n${blogLink}`, imageUrl);
        console.log("Workflow Complete!");

    } catch (error) {
        console.error("Workflow failed:", error);
    }
}

startWorkflow();

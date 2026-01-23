const gemini = require('./src/services/gemini');
const images = require('./src/services/images');
const firebase = require('./src/services/firebase');
const blogger = require('./src/services/blogger');
const telegram = require('./src/services/telegram');
const helpers = require('./src/utils/helpers');

async function startWorkflow() {
    try {
        console.log("Checking Telegram...");
        if (!(await telegram.checkForTrigger())) return;

        console.log("Generating Content...");
        const blogData = await gemini.generateBlogPost();

        if (helpers.isDuplicate(blogData.title)) {
            console.log("Duplicate detected. Skipping.");
            return;
        }

        console.log("Creating Image...");
        const imageData = await images.createBlogImage(blogData.title);

        console.log("Saving Image...");
        // NOTE: We pass imageData.filePath here to fix the Error you got
        const imageUrl = await firebase.uploadFile(imageData.filePath);

        console.log("Posting to Blogger...");
        const blogLink = await blogger.postToBlogger(blogData, imageUrl);

        console.log("Sending to Telegram...");
        await telegram.sendLocalPhoto(`Done! \n\n${blogLink}`, imageData.filePath);

        helpers.saveToHistory(blogData.title);
        console.log("Workflow Complete!");
    } catch (e) { console.error("Workflow failed:", e); }
}
startWorkflow();

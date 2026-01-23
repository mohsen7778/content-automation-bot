const gemini = require('./src/services/gemini');
const images = require('./src/services/images');
const blogger = require('./src/services/blogger');
const telegram = require('./src/services/telegram');

async function startWorkflow() {
    try {
        console.log("Checking Telegram...");
        if (!(await telegram.checkForTrigger())) return;

        console.log("Generating Blog...");
        const blogData = await gemini.generateBlogPost();

        console.log("Creating Image...");
        const imageData = await images.createBlogImage(blogData.title);

        console.log("Posting to Blogger...");
        // We send the Base64 image string here
        const blogLink = await blogger.postToBlogger(blogData.title, blogData.content, imageData.base64Image);

        console.log("Sending to Telegram...");
        // We send the local file here
        await telegram.sendLocalPhoto(blogData.title + "\n\n" + blogLink, imageData.filePath);

        console.log("DONE!");
    } catch (e) { console.error(e); }
}
startWorkflow();

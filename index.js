const gemini = require('./src/services/gemini');
const images = require('./src/services/images');
const firebase = require('./src/services/firebase');
const blogger = require('./src/services/blogger');
const telegram = require('./src/services/telegram');

async function startWorkflow() {
    try {
        if (!(await telegram.checkForTrigger())) return;

        const blogData = await gemini.generateBlogPost(); // Now gets Category, Title, Intro, etc.
        const imagePath = await images.createBlogImage(blogData.title);
        const imageUrl = await firebase.uploadFile(imagePath);
        
        // Pass the whole blogData object to the template
        const blogLink = await blogger.postToBlogger(blogData, imageUrl);

        await telegram.sendLocalPhoto(`Done! \n\n${blogLink}`, imagePath);
        console.log("Template post published!");
    } catch (e) { console.error(e); }
}
startWorkflow();

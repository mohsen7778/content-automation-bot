const gemini = require("./src/services/gemini");
const images = require("./src/services/images");
const blogger = require("./src/services/blogger");
const telegram = require("./src/services/telegram");
const helpers = require("./src/utils/helpers");

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

        console.log("Fetching Images...");
        const imageUrls = await images.getImages(blogData.title, 3);

        const imageHTML = imageUrls
            .map(
                url =>
                    `<div class="mia-image-wrap"><img src="${url}" alt="${blogData.title}"></div>`
            )
            .join("\n");

        const finalBody = imageHTML + "\n" + blogData.body;

        console.log("Posting to Blogger...");
        const blogLink = await blogger.postToBlogger(
            { ...blogData, body: finalBody }
        );

        console.log("Sending to Telegram...");
        await telegram.sendMessage(`New post published:\n${blogLink}`);

        helpers.saveToHistory(blogData.title);
        console.log("Workflow Complete!");

    } catch (e) {
        console.error("Workflow failed:", e);
    }
}

startWorkflow();

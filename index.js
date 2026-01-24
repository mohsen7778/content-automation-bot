require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { generateBlogPost } = require('./src/services/gemini'); 
const { postToBlogger } = require('./src/services/blogger');
const { sendToTelegram } = require('./src/services/telegram');

// YOUR 10 TOPICS
const niches = [
  "Life and productivity",
  "Food and simple recipes",
  "Fitness and gentle movement",
  "Health and wellness",
  "Beauty and everyday care",
  "Money and work habits",
  "Tech and modern life",
  "Mindset, habits, and inner clarity",
  "Home styling and slow living",
  "Travel and soul growth"
];

const statePath = path.join(__dirname, 'data', 'state.json');

async function runBot() {
    try {
        // 1. Load state
        if (!fs.existsSync(statePath)) {
            if (!fs.existsSync(path.dirname(statePath))) fs.mkdirSync(path.dirname(statePath));
            fs.writeFileSync(statePath, JSON.stringify({ nextNicheIndex: 0, usedImageUrls: [] }));
        }
        let state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

        // 2. Select the niche
        let currentNiche = niches[state.nextNicheIndex];
        console.log(`Running Topic ${state.nextNicheIndex + 1}: ${currentNiche}`);

        // 3. Generate content
        const blogData = await generateBlogPost(currentNiche);

        // 4. Post to Blogger
        const postUrl = await postToBlogger(blogData);
        console.log("Success! Post live at:", postUrl);

        // 5. SEND TO TELEGRAM
        await sendToTelegram(blogData.title, postUrl, blogData.featuredImage);

        // 6. Update state for next run
        state.nextNicheIndex = (state.nextNicheIndex + 1) % niches.length;
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    } catch (error) {
        console.error("Bot failed:", error);
        process.exit(1);
    }
}

runBot();

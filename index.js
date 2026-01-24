require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { generateBlogPost } = require('./src/services/gemini'); 
const { postToBlogger } = require('./src/services/blogger');

// THE 10 TOPICS
const niches = [
  "Life and productivity",
  "Food and simple recipes",
  "Fitness and gentle movement",
  "Health and wellness",
  "Beauty and everyday care",
  "Money and work habits",
  "Tech and modern life",
  "Mindset and habits",
  "Home decor and slow living",
  "Travel and inner clarity"
];

const statePath = path.join(__dirname, 'src', 'services', 'data', 'state.json');

async function runBot() {
    try {
        // 1. Read current state to see which niche is next
        let state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        let currentNiche = niches[state.nextNicheIndex];

        console.log(`--- Topic ${state.nextNicheIndex + 1} of 10: ${currentNiche} ---`);

        // 2. Generate post for THIS specific niche
        const blogData = await generateBlogPost(currentNiche);

        // 3. Post to Blogger
        const postUrl = await postToBlogger(blogData);
        console.log("Success! Post live at:", postUrl);

        // 4. Update index for next time (Cycle 0 to 9)
        state.nextNicheIndex = (state.nextNicheIndex + 1) % niches.length;
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        
        console.log(`Next run will be Topic: ${niches[state.nextNicheIndex]}`);

    } catch (error) {
        console.error("Bot failed:", error);
        process.exit(1);
    }
}

runBot();

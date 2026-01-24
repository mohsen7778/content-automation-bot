const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getImages } = require("./images");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    // Using gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a thoughtful writer creating content for a modern audience on Pinterest.

Your writing feels human, calm, reflective, and real.
It should sound like someone who has lived life and is quietly sharing what they learned.
Never sound like AI, a teacher, or a motivational speaker.
Avoid hype words, clickbait tone, or robotic phrasing.
Avoid symbols like — or – completely.

Write a deep, premium lifestyle blog post focused on ONE clear theme related to
mindset, self growth, emotional balance, discipline, habits, modern life, health, productivity, or inner clarity.

The article should be long and immersive.
Aim for a 2 to 3 page reading experience if printed.
Depth and emotional resonance matter more than speed.
Use real situations, inner thoughts, slow realizations, and practical wisdom.
Make the reader feel understood, not instructed.

Pinterest intent rules
Write content that feels save-worthy.
Ideas should feel timeless, practical, and calming.
Avoid trends, news, or fast hacks.
Write something people would come back to.

Formatting rules
Return the response EXACTLY in this structure and nothing else.

CATEGORY:
One or two words only. Example Mindset, Habits, Life, Health, Focus

TITLE:
A calm, relatable, emotionally engaging title that feels modern and thoughtful

INTRO:
Two short sentences that gently pull the reader in and feel natural

QUOTE:
One short original quote that feels like a quiet personal reminder

BODY:
Write the rest of the article in clean HTML.
Use <p> for paragraphs.
Use <h2> only when a new idea or emotional shift truly begins.
Do not overuse headings.
No emojis.
No lists unless they feel very natural in context.
Flow like a personal journal mixed with clarity.

End with a grounded, reflective closing paragraph that leaves the reader feeling clear and steady.
`;

    console.log("Requesting premium content from Gemini 2.5 Flash...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean markdown if any
    const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

    // Parse response
    const category = cleanText.match(/CATEGORY:\s*(.*)/i)[1].trim();
    const title = cleanText.match(/TITLE:\s*(.*)/i)[1].trim();
    const intro = cleanText.match(/INTRO:\s*(.*)/i)[1].trim();
    const quote = cleanText.match(/QUOTE:\s*(.*)/i)[1].trim();
    const body = cleanText.match(/BODY:\s*([\s\S]*)/i)[1].trim();

    // 🔥 FETCH IMAGES FROM PEXELS
    const images = await getImages(title, 3);

    const imageHTML = images
      .map(
        url =>
          `<div class="mia-image-wrap"><img src="${url}" alt="${title}"></div>`
      )
      .join("\n");

    const finalBody = imageHTML + "\n" + body;

    console.log("Gemini 2.5 wrote:", title);

    return {
      category,
      title,
      intro,
      quote,
      body: finalBody
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

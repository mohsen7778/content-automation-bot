const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getImages } = require("./images");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a thoughtful writer for Notes from Mia. 
Tone: Calm, human, reflective. 

STRICT RULE: Do not use dashes like — or – anywhere in the text. Use commas, colons, or periods instead.

Write a deep, premium lifestyle post about: ${specificNiche}
The post should be long and immersive (2 to 3 pages reading experience).

Return EXACTLY this structure:
CATEGORY:
${specificNiche}

TITLE:
Relatable engaging title (No dashes)

IMAGE_KEYWORD:
1 to 3 descriptive words for Pexels search

INTRO:
Two short sentences (No dashes).

QUOTE:
One short original quote (No dashes).

BODY:
Write the article in clean HTML using <p> and <h2> only. No emojis. (Strictly no dashes — or –).
`;

    console.log("Gemini 2.5 Flash is composing...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

    const category = cleanText.match(/CATEGORY:\s*(.*)/i)[1].trim();
    const title = cleanText.match(/TITLE:\s*(.*)/i)[1].trim();
    const imageKeyword = cleanText.match(/IMAGE_KEYWORD:\s*(.*)/i)[1].trim();
    const intro = cleanText.match(/INTRO:\s*(.*)/i)[1].trim();
    const quote = cleanText.match(/QUOTE:\s*(.*)/i)[1].trim();
    const body = cleanText.match(/BODY:\s*([\s\S]*)/i)[1].trim();

    const images = await getImages(imageKeyword, 1);
    
    return { category, title, intro, quote, body, featuredImage: images[0] };
  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

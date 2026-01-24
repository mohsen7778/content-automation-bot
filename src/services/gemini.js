const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getImages } = require("./images");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a thoughtful writer for Notes from Mia. 
Topic niche for today: ${specificNiche}

Your tone is calm, human, and reflective. Avoid hype.
Write a deep, premium lifestyle post (2-3 pages long).

Return EXACTLY this structure:

CATEGORY:
${specificNiche}

TITLE:
Relatable engaging title

IMAGE_KEYWORD:
1 to 3 words for Pexels search (e.g. 'morning window', 'aesthetic coffee', 'slow walk')

INTRO:
Two short sentences.

QUOTE:
One short original quote.

BODY:
Long article in HTML using <p> and <h2> only. No emojis.
`;

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

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    // UPDATED: Using the powerful new gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a thoughtful female lifestyle writer writing for women aged 18 to 35.
Your tone is calm, emotionally intelligent, warm, and human.
Write like a real person sharing life advice, not like AI.
Avoid symbols like — or – completely.
Use simple words, deep feelings, and natural flow.

Write a premium lifestyle blog post about self growth, mindset, emotional balance, or modern woman life.

Return the response EXACTLY in this format and nothing extra:

CATEGORY: one or two words like Mindset, Self Care, Life Advice, Confidence

TITLE: an elegant, relatable, emotionally engaging title that feels personal

INTRO: two short sentences that gently pull the reader in and feel comforting and real

QUOTE: one short original quote that feels like a personal thought or reminder

BODY:
Write the rest of the article in HTML.
Use <p> for paragraphs.
Use <h2> for section headings.
Write naturally like a journal mixed with advice.
No emojis.
No lists unless they feel very natural.
End the body with a calm reflective paragraph.
`;

    console.log("Requesting premium content from Gemini 2.5 Flash...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up any markdown code blocks the AI might add
    const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

    // Parsing using your Regex logic
    const category = cleanText.match(/CATEGORY:\s*(.*)/i)[1].trim();
    const title = cleanText.match(/TITLE:\s*(.*)/i)[1].trim();
    const intro = cleanText.match(/INTRO:\s*(.*)/i)[1].trim();
    const quote = cleanText.match(/QUOTE:\s*(.*)/i)[1].trim();
    const body = cleanText.match(/BODY:\s*([\s\S]*)/i)[1].trim();

    console.log("Gemini 2.5 wrote: " + title);
    return { category, title, intro, quote, body };

  } catch (error) {
    console.error("Gemini 2.5 Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

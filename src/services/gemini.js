const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(specificNiche) {
  try {
    // RESTORED: Using the exact model from your original file
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
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

    // Extract Data using Regex
    const titleMatch = cleanText.match(/TITLE:\s*(.*)/i);
    const keywordMatch = cleanText.match(/IMAGE_KEYWORD:\s*(.*)/i);
    const bodyMatch = cleanText.match(/BODY:\s*([\s\S]*)/i);

    const title = titleMatch ? titleMatch[1].trim() : "Mindful Living";
    const imagePrompt = keywordMatch ? keywordMatch[1].trim() : "nature";
    const htmlContent = bodyMatch ? bodyMatch[1].trim() : "<p>Content generation failed.</p>";

    return { title, htmlContent, imagePrompt };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateContent };

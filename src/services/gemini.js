const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // We use a custom separator "|||" to reliably split the sections
    const prompt = `
    You are a thoughtful writer for Notes from Mia.
    Topic: ${specificNiche}
    
    STRICT OUTPUT FORMAT:
    Separate these 6 sections with "|||" exactly.
    
    Structure:
    CATEGORY ||| TITLE ||| INTRO (2 sentences) ||| QUOTE (1 sentence) ||| IMAGE_KEYWORD ||| HTML_BODY
    
    Rules:
    - write 2 full pages or 3 human like not like ai
    - No — or -
    - Body must use <p> and <h2> only. No markdown.
    - Category should be short (e.g., Mindfulness).
    `;

    console.log("Gemini is composing...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const parts = text.split("|||");

    if (parts.length < 6) {
        throw new Error("Gemini generation failed formatting.");
    }

    return { 
        category: parts[0].trim(),
        title: parts[1].trim(), 
        intro: parts[2].trim(),
        quote: parts[3].trim(),
        imagePrompt: parts[4].trim(), 
        body: parts[5].trim() 
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateContent };

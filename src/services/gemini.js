const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // We ask for a specific separator (|||) to make parsing 100% fail-proof
    const prompt = `
    Write a premium blog post about: ${specificNiche}
    
    STRICT OUTPUT FORMAT:
    You must separate the Title, Image Keyword, and HTML Body with "|||".
    
    Structure:
    TITLE ||| IMAGE_KEYWORD ||| HTML_BODY
    
    Example:
    Morning Routine ||| Sunrise ||| <p>This is the post...</p>
    
    Rules:
    1. No markdown (no ** or ##).
    2. No labels (Do not write "Title:").
    3. Use <p> and <h2> tags for the body.
    `;

    console.log("Gemini 2.5 Flash is composing...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Split the text by our special separator
    const parts = text.split("|||");

    // Safety Check: If AI misses the format, fallback instead of crashing
    if (parts.length < 3) {
        console.log("Format warning, using fallback parsing.");
        return {
            title: "New Blog Post",
            imagePrompt: "lifestyle",
            htmlContent: text // Dump the raw text so you don't lose the content
        };
    }

    return { 
        title: parts[0].trim(), 
        imagePrompt: parts[1].trim(), 
        htmlContent: parts[2].trim() 
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateContent };

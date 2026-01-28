const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" } // Force JSON mode
    });

    const prompt = `
    You are a professional blog writer.
    Topic: ${specificNiche}
    
    Output strictly valid JSON with this schema:
    {
      "title": "Engaging Title (No dashes)",
      "imagePrompt": "3 descriptive words for Pexels",
      "htmlContent": "<h1>Header</h1><p>Deep, immersive blog post body...</p>"
    }
    `;

    console.log("Gemini is composing (JSON Mode)...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Parse the JSON reliably
    const data = JSON.parse(response.text());

    return { 
        title: data.title, 
        htmlContent: data.htmlContent, 
        imagePrompt: data.imagePrompt 
    };

  } catch (error) {
    console.error("Gemini JSON Error:", error.message);
    // Fallback so the bot doesn't crash
    return {
        title: "New Post",
        htmlContent: "<p>Draft generation failed. Please check logs.</p>",
        imagePrompt: "nature"
    };
  }
}

module.exports = { generateContent };

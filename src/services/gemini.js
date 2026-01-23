const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // We add "Return ONLY the raw text" to keep Gemini 3 from being too chatty
    const prompt = "Write a short, engaging blog post about a trending tech topic. " +
                   "Return ONLY the following format without any other text or thinking:\n" +
                   "TITLE: [Title Here]\n" +
                   "CONTENT: [HTML Body Here]";

    console.log("Requesting content from Gemini 3 Flash...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    /** * CLEANING LAYER:
     * 1. Remove "Thinking" blocks if they appear in text
     * 2. Remove Markdown code blocks like ```html
     * 3. Extract only the portion between the first 'TITLE:' and the end
     */
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, ""); // Remove hidden thoughts
    text = text.replace(/```html|```/g, "").trim(); 

    // Safety check: Find where the actual content starts
    const startIndex = text.toUpperCase().indexOf("TITLE:");
    if (startIndex === -1) {
        console.log("Malformed Response: " + text);
        throw new Error("AI failed to include 'TITLE:' in its output.");
    }
    
    const cleanText = text.substring(startIndex);

    if (!cleanText.includes("TITLE:") || !cleanText.includes("CONTENT:")) {
        throw new Error("AI response format was incorrect.");
    }

    const title = cleanText.split(/TITLE:/i)[1].split(/CONTENT:/i)[0].trim();
    const content = cleanText.split(/CONTENT:/i)[1].trim();

    console.log("Successfully generated: " + title);
    return { title, content };

  } catch (error) {
    console.error("Gemini 3 Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    // UPDATED: Using the new Gemini 3 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = "Write a short, engaging blog post about a trending tech topic. " +
                   "Return the result EXACTLY in this format:\n" +
                   "TITLE: [Title Here]\n" +
                   "CONTENT: [HTML Body Here]";

    console.log("Requesting content from Gemini 3 Flash...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up any extra AI markdown like ```html or ```
    text = text.replace(/```html/g, "").replace(/```/g, "").trim();

    if (!text.includes("TITLE:") || !text.includes("CONTENT:")) {
        console.log("Raw AI response was: " + text);
        throw new Error("AI response format was incorrect.");
    }

    const title = text.split("TITLE:")[1].split("CONTENT:")[0].trim();
    const content = text.split("CONTENT:")[1].trim();

    console.log("Successfully generated: " + title);
    return { title, content };

  } catch (error) {
    console.error("Gemini 3 Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

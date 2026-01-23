const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    // Using the EXACT name from your discovery list: gemini-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = "Write a short blog post about trending technology. " +
                   "Format exactly like this:\n" +
                   "TITLE: [Title]\n" +
                   "CONTENT: [HTML Body]";

    console.log("Requesting content from gemini-flash-latest...");
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const title = text.split("TITLE:")[1].split("CONTENT:")[0].trim();
    const content = text.split("CONTENT:")[1].trim().replace(/```html/g, "").replace(/```/g, "");

    console.log("Success! Title: " + title);
    return { title, content };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

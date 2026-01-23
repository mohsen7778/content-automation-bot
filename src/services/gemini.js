const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    // UPDATED: Using the exact model name from your discovery list
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "Write a professional, engaging blog post about a trending tech or AI topic. " +
                   "Return the result EXACTLY in this format:\n" +
                   "TITLE: [The Title]\n" +
                   "CONTENT: [The HTML Body]";

    console.log("Requesting content from Gemini 2.0 Flash...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown markers if AI adds them
    text = text.replace(/```html/g, "").replace(/```/g, "").trim();

    // Parse the Title and Content
    const title = text.split("TITLE:")[1].split("CONTENT:")[0].trim();
    const content = text.split("CONTENT:")[1].trim();

    console.log("Successfully generated: " + title);
    return { title, content };

  } catch (error) {
    console.error("Gemini Service Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

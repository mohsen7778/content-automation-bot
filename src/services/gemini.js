const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    // UPDATED: Using the 'latest' alias which is most stable for free tier
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = "Write a short, engaging blog post about a trending tech topic. " +
                   "Format your response EXACTLY like this:\n" +
                   "TITLE: [The Title]\n" +
                   "CONTENT: [The HTML Body]";

    console.log("Requesting content from Gemini Flash (Latest)...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Cleaning AI markdown
    text = text.replace(/```html/g, "").replace(/```/g, "").trim();

    const title = text.split("TITLE:")[1].split("CONTENT:")[0].trim();
    const content = text.split("CONTENT:")[1].trim();

    console.log("Successfully generated: " + title);
    return { title, content };

  } catch (error) {
    console.error("Gemini Quota/Model Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

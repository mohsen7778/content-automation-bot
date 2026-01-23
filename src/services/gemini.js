const { GoogleGenerativeAI } = require("@google/generative-ai");

// The API Key is pulled from your GitHub Secrets
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  // We updated this from gemini-pro to gemini-1.5-flash
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a short, professional blog post about a trending tech or lifestyle topic. " +
                 "Return the response in this EXACT format:\n" +
                 "TITLE: [The blog title here]\n" +
                 "CONTENT: [The blog post body in HTML format here]";

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Slicing the response to separate the Title and the HTML Content
    const title = text.split("TITLE:")[1].split("CONTENT:")[0].trim();
    const content = text.split("CONTENT:")[1].trim();

    console.log("Gemini successfully generated: " + title);
    
    return { title, content };
  } catch (error) {
    console.error("Gemini Generation Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

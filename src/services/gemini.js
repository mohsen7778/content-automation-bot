const { GoogleGenerativeAI } = require("@google/generative-ai");

// We will store the key in GitHub Secrets later
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // The instructions for the AI
  const prompt = "Write a short, engaging blog post about a random trending tech or lifestyle topic. Return it in this exact format: \n TITLE: [title here] \n CONTENT: [html blog body here]";

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Split the AI response to get Title and Content separately
  const title = text.split("TITLE:")[1].split("CONTENT:")[0].trim();
  const content = text.split("CONTENT:")[1].trim();

  return { title, content };
}

module.exports = { generateBlogPost };

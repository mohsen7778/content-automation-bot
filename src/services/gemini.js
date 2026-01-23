const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    // Let's list all models first to see what you have access to
    console.log("Checking available models for your API key...");
    const fetch = require('node-fetch'); // We use this to talk to the API directly
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
        console.log("Your available models are:");
        data.models.forEach(m => console.log("- " + m.name.replace('models/', '')));
    } else {
        console.log("Could not list models. Response:", JSON.stringify(data));
    }

    // Attempting to use the most common one again
    const modelName = "gemini-1.5-flash"; 
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = "Write a short blog post about trending tech. TITLE: [Title] CONTENT: [HTML]";
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const title = text.match(/TITLE:\s*(.*)/i)[1].trim();
    const content = text.match(/CONTENT:\s*([\s\S]*)/i)[1].trim();

    return { title, content };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a blog post using Gemini with built-in retry logic for 503 errors.
 * @param {number} retries - Number of times to retry if the server is overloaded.
 */
async function generateBlogPost(retries = 3) {
  try {
    // We use 1.5-flash for stability; change to "gemini-3-flash" once out of preview.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Write a short, engaging blog post about a trending tech topic. " +
                   "Return ONLY the following format without any other text:\n" +
                   "TITLE: [Title Here]\n" +
                   "CONTENT: [HTML Body Here]";

    console.log("Requesting content from Gemini...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 1. Clean up thoughts/markdown
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, ""); 
    text = text.replace(/```html|```/g, "").trim(); 

    // 2. Find the start of the actual content
    const startIndex = text.toUpperCase().indexOf("TITLE:");
    if (startIndex === -1) {
        throw new Error("AI failed to include 'TITLE:' in its output.");
    }
    const cleanText = text.substring(startIndex);

    // 3. Split the result
    const title = cleanText.split(/TITLE:/i)[1].split(/CONTENT:/i)[0].trim();
    const content = cleanText.split(/CONTENT:/i)[1].trim();

    console.log("Successfully generated: " + title);
    return { title, content };

  } catch (error) {
    // If the error is 503 (Overloaded), wait 5 seconds and try again
    if (error.status === 503 && retries > 0) {
      console.log(`Model overloaded. Retrying in 5s... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return generateBlogPost(retries - 1);
    }
    
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

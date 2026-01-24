const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getImages } = require("./images");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a thoughtful writer for Notes from Mia.
Your tone is calm, human, reflective, and quietly grounded. Avoid hype, buzzwords, and symbols like — or –.

Write a deep, premium lifestyle post focused on ONE clear theme chosen naturally from these specific niches:
- Life and productivity  
- Food and simple recipes  
- Fitness and gentle movement  
- Health and wellness  
- Beauty and everyday care  
- Money and work habits  
- Tech and modern life  
- Mindset, habits, and inner clarity

Do not name the niche directly. Let it feel lived-in and natural.
The post must be long and immersive (aim for a 2 to 3 page reading experience).

Return the response EXACTLY in this structure:

CATEGORY:
Two words maximum

TITLE:
A calm, relatable, Pinterest-style title

IMAGE_KEYWORD:
1 to 3 descriptive words for a Pexels search that fits what we are writing about exactly (e.g., 'minimalist kitchen light', 'woman journaling forest', 'soft morning sunlight')

INTRO:
Two short sentences that pull the reader in.

QUOTE:
One short original quote.

BODY:
Write the long article in clean HTML using <p> and <h2> only. No emojis. No lists.
End with a soft, reflective closing paragraph.
`;

    console.log("Gemini 2.5 Flash is composing your premium post...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

    // Parsing logic
    const category = cleanText.match(/CATEGORY:\s*(.*)/i)[1].trim();
    const title = cleanText.match(/TITLE:\s*(.*)/i)[1].trim();
    const imageKeyword = cleanText.match(/IMAGE_KEYWORD:\s*(.*)/i)[1].trim();
    const intro = cleanText.match(/INTRO:\s*(.*)/i)[1].trim();
    const quote = cleanText.match(/QUOTE:\s*(.*)/i)[1].trim();
    const body = cleanText.match(/BODY:\s*([\s\S]*)/i)[1].trim();

    // Fetch the relevant image using the 1-3 word keyword
    const images = await getImages(imageKeyword, 1);
    
    return {
      category,
      title,
      intro,
      quote,
      body,
      featuredImage: images[0]
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

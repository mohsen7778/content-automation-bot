const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getImages } = require("./images");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a thoughtful writer for Notes from Mia.

Your tone is calm, human, reflective, and quietly grounded.
Write like someone sharing lived experience and gentle clarity.
Never sound like AI, a teacher, or a motivational speaker.
Avoid hype, buzzwords, and clickbait language.
Avoid symbols like — or – completely.

Write a deep, premium lifestyle post focused on ONE clear theme chosen naturally from these high traffic Pinterest niches:

Life and productivity  
Food and simple recipes  
Fitness and gentle movement  
Health and wellness  
Beauty and everyday care  
Money and work habits  
Tech and modern life  
Mindset, habits, and inner clarity  

Do not name the niche directly.
Let it feel natural and lived in.

The post should be long, immersive, and slow.
Aim for a 2 to 3 page reading experience.
Depth and emotional honesty matter more than speed.
Use real moments, inner thoughts, quiet realizations, and practical wisdom.
Make the reader feel understood, not instructed.

Pinterest intent rules  
The content should feel save worthy.  
Timeless, calming, and useful.  
Something the reader would come back to on a quiet day.

Write in clean HTML.
Use <p> for paragraphs.
Use <h2> only when a natural shift in thought happens.
Do not overuse headings.
No emojis.
No lists unless they feel very natural in context.

End with a soft, reflective closing that leaves the reader feeling clear and steady.
`;

    console.log("Gemini 2.5 Flash is composing...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

    // Parsing with your logic
    const category = cleanText.match(/CATEGORY:\s*(.*)/i)[1].trim();
    const title = cleanText.match(/TITLE:\s*(.*)/i)[1].trim();
    const imageKeyword = cleanText.match(/IMAGE_KEYWORD:\s*(.*)/i)[1].trim();
    const intro = cleanText.match(/INTRO:\s*(.*)/i)[1].trim();
    const quote = cleanText.match(/QUOTE:\s*(.*)/i)[1].trim();
    const body = cleanText.match(/BODY:\s*([\s\S]*)/i)[1].trim();

    // Use the keyword Gemini suggested to get a relevant image
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

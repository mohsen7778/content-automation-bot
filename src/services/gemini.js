const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getImages } = require("./images"); // This points to the file below

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlogPost() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a thoughtful writer creating content for a modern audience on Pinterest.
Your writing feels human, calm, reflective, and real.
It should sound like someone who has lived life and is quietly sharing what they learned.
Never sound like AI, a teacher, or a motivational speaker.
Avoid hype words, clickbait tone, or robotic phrasing.
Avoid symbols like — or – completely.

Write a deep, premium lifestyle blog post focused on ONE clear theme related to
mindset, self growth, emotional balance, discipline, habits, modern life, health, productivity, or inner clarity.

Return the response EXACTLY in this structure and nothing else.

CATEGORY:
One or two words only.

TITLE:
A calm, relatable title

INTRO:
Two short sentences

QUOTE:
One short original quote

BODY:
Write the rest of the article in clean HTML. Use <p> and <h2> only.
`;

    console.log("Requesting premium content from Gemini...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

    const category = cleanText.match(/CATEGORY:\s*(.*)/i)[1].trim();
    const title = cleanText.match(/TITLE:\s*(.*)/i)[1].trim();
    const intro = cleanText.match(/INTRO:\s*(.*)/i)[1].trim();
    const quote = cleanText.match(/QUOTE:\s*(.*)/i)[1].trim();
    const body = cleanText.match(/BODY:\s*([\s\S]*)/i)[1].trim();

    // FETCH 3 IMAGES FROM PEXELS
    const images = await getImages(title, 3);

    const imageHTML = images
      .map(url => `<div class="mia-image-wrap"><img src="${url}" alt="${title}"></div>`)
      .join("\n");

    // We combine images and body for the Blogger template
    const finalBody = imageHTML + "\n" + body;

    return {
      category,
      title,
      intro,
      quote,
      body: finalBody
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateBlogPost };

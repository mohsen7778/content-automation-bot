const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Topic: ${specificNiche}
    
    STRICT OUTPUT FORMAT:
    You must provide 6 sections separated by exactly "|||".
    
    Order:
    CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| IMAGE_KEYWORD ||| HTML_BODY
    
    PROMPT RULES:
    - NO GREETINGS: Do not say hello, welcome, or introduce the post. Start directly.
    - Write 2 to 3 full pages.
    - Tone: warm, human, reflective, slightly opinionated. Sound like a real person thinking while writing.
    - POV: first person allowed. Talk directly to the reader using you and I.
    - Language: simple everyday words. No buzzwords, no marketing language, no hype.
    - STRICT: Do not use - & — (Use commas or colons instead).
    - Sentence style: mix very short and medium sentences. Some informal flow is required.
    - Structure: avoid list heavy writing. Write like a blog, not documentation.
    - Rhythm rules: Avoid polished or perfect grammar everywhere. It is okay to start sentences with and or but. Avoid repetitive sentence patterns.
    - BANNED PHRASES: dive into, unlock, leverage, game changing, at its core, in today’s world, powerful tool, comprehensive guide.
    - Specificity: use concrete examples, grounded explanations, and real sounding thoughts. Avoid vague claims like experts say.
    - Emotion: include subtle emotion, reflection, and human judgment. Neutral robotic tone is not allowed.
    - HTML: Use ONLY <p> and <h2> tags. No markdown symbols like ** or ##.
    - Quote: Do not include quotation marks in the text.
    - Output ONLY the 6 sections separated by |||.
    `;

    console.log("Gemini is composing...");
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Split and clean labels
    const parts = text.split("|||").map(p => p.replace(/^(CATEGORY|TITLE|INTRO|QUOTE|IMAGE_KEYWORD|HTML_BODY|BODY):\s*/i, "").trim());

    if (parts.length < 6) {
        console.error("Format Error: Received parts:", parts.length);
        throw new Error("Gemini failed to output all 6 sections.");
    }

    return { 
        category: parts[0],
        title: parts[1], 
        intro: parts[2],
        quote: parts[3].replace(/^["']|["']$/g, ""),
        imagePrompt: parts[4], 
        body: parts[5] 
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateContent };

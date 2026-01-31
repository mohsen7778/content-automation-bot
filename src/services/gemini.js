const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateContent(specificNiche) {
  try {
    console.log(`\n🔌 Connecting to Google Gemini (gemini-2.5-flash)...`);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env file.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Using the latest model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🔥 STYLE GUIDE: ANTI-AI SMELL INSTRUCTIONS
    const prompt = `
Topic: "${specificNiche}"

STYLE GUIDE (CRITICAL):
1. WRITE LIKE A HUMAN: Use short sentences. Be punchy. Be conversational.
2. NO "AI SMELL": Do NOT use robotic metaphors.
3. BANNED WORDS (DO NOT USE): "Unlock", "Unleash", "Elevate", "Dive in", "Realm", "Symphony", "Game-changer", "Tapestry", "Mastering", "Harness".
4. INTRO: Start directly with a hook or a question. No "Welcome to my blog" fluff.
5. BODY: Use bullet points and bold text for readability.

STRICT FORMAT: Return exactly 8 sections separated by "|||".
Order: NICHE_NAME ||| BLOG_TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| SUB_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

RULES FOR SECTIONS: 
1. PIN_HOOK: Main punchy headline (2-4 words, ALL CAPS). High impact.
2. SUB_HOOK: Supporting subtitle (4-6 words, descriptive). No filler.
3. Do NOT include labels like "PIN_HOOK:" or "SUB_HOOK:".
4. HTML_BODY: Use <p>, <h2>, <ul>, and <li> tags only. Keep it clean.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse Response
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 8) {
      console.warn("⚠️ AI output format warning. Using fallbacks.");
      return {
        category: parts[0] || "Lifestyle",
        title: parts[1] || specificNiche,
        intro: parts[2] || "A quick guide.",
        quote: parts[3] || "Consistency is key.",
        pinHook: parts[4] || "READ NOW", 
        subHook: parts[5] || "Click to read more",
        imagePrompt: parts[6] || "lifestyle",
        body: parts[7] || `<p>${text}</p>` 
      };
    }

    const cleanCategory = parts[0].replace(/^(Category|Topic|Niche):\s*/i, "").replace(/\*/g, "");
    const cleanTitle = parts[1].replace(/^(Title|Blog Title):\s*/i, "").replace(/"/g, "");
    const cleanPinHook = parts[4].replace(/^(PIN_HOOK|Hook):\s*/i, "").toUpperCase();
    const cleanSubHook = parts[5].replace(/^(SUB_HOOK|Subtitle):\s*/i, "");

    return { 
      category: cleanCategory, 
      title: cleanTitle, 
      intro: parts[2],
      quote: parts[3], 
      pinHook: cleanPinHook,
      subHook: cleanSubHook,
      imagePrompt: parts[6], 
      body: parts[7] 
    };

  } catch (error) {
    console.error(`❌ Gemini Error: ${error.message}`);
    throw new Error(error.message);
  }
}

module.exports = { generateContent };

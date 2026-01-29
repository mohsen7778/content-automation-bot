const axios = require("axios");

async function generateContent(specificNiche) {
  const API_URL = "https://models.inference.ai.azure.com/chat/completions";
  
  // Using gpt-4o-mini via GitHub Models
  const MODEL_ID = "gpt-4o-mini"; 

  try {
    console.log(`\n🔌 Connecting to GitHub Models (${MODEL_ID})...`);

    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is missing.");
    }
    
    // UPDATED PROMPT:
    // 1. Changed "CATEGORY" to "NICHE_NAME" to stop AI from writing "Category: ..."
    // 2. Added explicit rule "Do NOT include labels"
    const prompt = `
Topic: "${specificNiche}"
STRICT FORMAT: Return 7 sections separated by "|||".
Order: NICHE_NAME ||| BLOG_TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

RULES: 
1. Do NOT include labels (e.g. Do NOT write "Category: Mindfulness", just write "Mindfulness").
2. PIN_HOOK: 3-5 words max.
3. HTML_BODY: Use <p> and <h2> tags only. No markdown formatting.
4. NICHE_NAME: A short 1-2 word category name.
`;

    const response = await axios.post(
      API_URL,
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: "You are a professional blogger. Output raw text separated by delimiters only." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.8
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 60000 
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error(`API returned status ${response.status} but no content.`);
    }

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 7) {
      console.warn("⚠️ Formatting mismatch. Attempting to patch...");
      return {
        category: parts[0] || "Lifestyle",
        title: parts[1] || specificNiche,
        intro: parts[2] || "A quick guide.",
        quote: parts[3] || "Consistency is key.",
        pinHook: parts[4] || "READ NOW", 
        imagePrompt: parts[5] || "lifestyle",
        body: parts[6] || `<p>${text}</p>` 
      };
    }

    // SAFETY CLEANING:
    // This removes "Category:" or "Title:" if the AI accidentally adds it despite instructions.
    const cleanCategory = parts[0].replace(/^(Category|Topic|Niche):\s*/i, "").replace(/\*/g, "");
    const cleanTitle = parts[1].replace(/^(Title|Blog Title):\s*/i, "").replace(/"/g, "");

    console.log(`✅ Success with ${MODEL_ID}`);
    
    return { 
      category: cleanCategory, 
      title: cleanTitle, 
      intro: parts[2],
      quote: parts[3], 
      pinHook: parts[4], 
      imagePrompt: parts[5], 
      body: parts[6] 
    };

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`❌ GitHub Model Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

module.exports = { generateContent };

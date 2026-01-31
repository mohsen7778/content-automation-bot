const axios = require("axios");

async function generateContent(specificNiche) {
  const API_URL = "https://models.inference.ai.azure.com/chat/completions";
  const MODEL_ID = "gpt-4o-mini"; 

  try {
    console.log(`\n🔌 Connecting to GitHub Models (${MODEL_ID})...`);

    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is missing.");
    }
    
    // UPDATED PROMPT: Added SUB_HOOK (8 sections)
    const prompt = `
Topic: "${specificNiche}"
STRICT FORMAT: Return 8 sections separated by "|||".
Order: NICHE_NAME ||| BLOG_TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| SUB_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

RULES: 
1. PIN_HOOK: Main punchy headline (2-4 words, ALL CAPS). Big impact.
2. SUB_HOOK: Supporting subtitle (4-7 words, descriptive). Explains the hook.
3. Do NOT include labels like "PIN_HOOK:" or "SUB_HOOK:".
4. HTML_BODY: Use <p> and <h2> tags only.
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

    // Fallback if AI messes up format
    if (parts.length < 8) {
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
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`❌ GitHub Model Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

module.exports = { generateContent };

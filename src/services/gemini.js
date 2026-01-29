const axios = require("axios");

async function generateContent(specificNiche) {
  // VERIFIED OFFICIAL 2026 ENDPOINT
  const API_URL = "https://api.deepseek.com/chat/completions";
  const MODEL_ID = "deepseek-chat"; 

  try {
    console.log(`\n🔌 Connecting to Official DeepSeek API (${MODEL_ID})...`);

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is missing from GitHub Secrets.");
    }
    
    const prompt = `
Topic: "${specificNiche}"

STRICT OUTPUT FORMAT:
Provide 7 sections separated by exactly "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

VOICE AND STYLE:
Human blogger tone. Use contractions. No AI clichés (delve, tapestry, landscape). conversational but authoritative.

SPECIFIC SECTION RULES:
- PIN_HOOK: 3-5 aggressive Pinterest hook words (e.g., "STOP BUYING TRASH").
- IMAGE_KEYWORD: EXACTLY 2 words for search. NO punctuation.
- HTML_BODY: Roughly 300 words. Use ONLY <p> and <h2> tags.

Output ONLY the 7 sections separated by |||.
`;

    const response = await axios.post(
      API_URL,
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: "You are a professional human blogger." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1200,
        temperature: 1.1, 
        response_format: { type: "text" } 
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 90000 
      }
    );

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 7) {
      console.warn(`⚠️ Parts mismatch (${parts.length}/7). Patching...`);
      return {
        category: parts[0] || "Lifestyle",
        title: parts[1] || specificNiche,
        intro: parts[2] || "Check out these great ideas.",
        quote: parts[3] || "Consistency is the key to results.",
        pinHook: parts[4] || "START TODAY", 
        imagePrompt: parts[5] || "lifestyle",
        body: parts[6] || `<p>${text}</p>` 
      };
    }

    console.log("✅ Content generated via DeepSeek.");

    return { 
      category: parts[0],
      title: parts[1], 
      intro: parts[2],
      quote: parts[3],
      pinHook: parts[4], 
      imagePrompt: parts[5], 
      body: parts[6] 
    };

  } catch (error) {
    const deepSeekError = error.response?.data?.error?.message || error.message;
    console.error(`❌ DeepSeek API Error: ${deepSeekError}`);
    throw new Error(`DeepSeek Error: ${deepSeekError}`);
  }
}

module.exports = { generateContent };

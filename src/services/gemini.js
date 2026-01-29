const axios = require("axios");

async function generateContent(specificNiche) {
  // Official GitHub Models Endpoint (2026 Verified)
  const API_URL = "https://models.inference.ai.azure.com/chat/completions";
  
  // Model ID for Grok 3 Mini on GitHub Marketplace
  const MODEL_ID = "azureml-xai/grok-3-mini"; 

  try {
    console.log(`\n🔌 Connecting to GitHub Models (${MODEL_ID})...`);
    
    const prompt = `
Topic: "${specificNiche}"
STRICT OUTPUT: 7 sections separated by "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY
RULES: Professional tone. PIN_HOOK 3-5 words. HTML_BODY use <p> and <h2> only. 200 words total.
`;

    const response = await axios.post(
      API_URL,
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: "You are a professional human blogger." },
          { role: "user", content: prompt }
        ],
        max_tokens: 700,
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

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 7) {
      console.warn("⚠️ Formatting mismatch. Patching...");
      return {
        category: parts[0] || "Lifestyle",
        title: parts[1] || specificNiche,
        intro: parts[2] || "A quick guide.",
        quote: parts[3] || "Consistency is key.",
        pinHook: parts[4] || "START NOW", 
        imagePrompt: parts[5] || "lifestyle",
        body: parts[6] || `<p>${text}</p>` 
      };
    }

    console.log("✅ Content Success!");
    return { 
      category: parts[0], title: parts[1], intro: parts[2],
      quote: parts[3], pinHook: parts[4], imagePrompt: parts[5], body: parts[6] 
    };

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`❌ GitHub Model Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

module.exports = { generateContent };

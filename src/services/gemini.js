const axios = require("axios");

async function generateContent(specificNiche) {
  // CORRECT ENDPOINT for Chat Models
  const API_URL = "https://router.huggingface.co/v1/chat/completions";
  
  // YOUR REQUESTED MODEL
  const MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0";

  try {
    console.log(`\n🔌 Connecting to Hugging Face Router (${MODEL_ID})...`);
    
    // TinyLlama is small but chat-optimized. We keep instructions simple.
    const prompt = `
You are a helpful blogger. Write a short blog post about: "${specificNiche}".

STRICT FORMATTING RULES:
1. Return EXACTLY 7 parts separated by "|||".
2. Do not include any introductory text like "Here is the blog post". Just the parts.
3. Order: Category ||| Title ||| Intro ||| Quote ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

DETAILS:
- PIN_HOOK: 3-5 aggressive words (e.g. "STOP WASTING MONEY").
- IMAGE_KEYWORD: 2 words max. No punctuation.
- HTML_BODY: Use <p> and <h2> tags only. Keep it under 200 words.

Output ONLY the 7 parts joined by |||.
`;

    const response = await axios.post(
      API_URL,
      {
        model: MODEL_ID, 
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 60000 // 60s timeout
      }
    );

    // PARSING: Standard OpenAI Format
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Empty response from Hugging Face Router");
    }

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    // FAIL-SAFE PATCHING
    // TinyLlama is smart, but if it misses a section, we fix it here.
    if (parts.length < 7) {
      console.warn(`⚠️ Formatting mismatch. Found ${parts.length} parts. Patching...`);
      return {
        category: parts[0] || "General",
        title: parts[1] || specificNiche,
        intro: parts[2] || "Here is a quick guide on this topic.",
        quote: parts[3] || "Small steps lead to big changes.",
        pinHook: parts[4] || "READ THIS NOW", 
        imagePrompt: parts[5] || "lifestyle",
        body: parts[6] || `<p>${text}</p>` 
      };
    }

    console.log("✅ Success with TinyLlama");

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
    // 503 means the model is loading. 
    if (error.response?.status === 503) {
      throw new Error("Model is loading (503). Please wait 30 seconds and run again.");
    }
    const msg = error.response?.data?.error?.message || error.message;
    console.error(`❌ Hugging Face Error: ${msg}`);
    throw error;
  }
}

module.exports = { generateContent };

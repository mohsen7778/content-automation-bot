const axios = require("axios");

async function generateContent(specificNiche) {
  // CORRECT 2026 ENDPOINT (OpenAI Compatible)
  const API_URL = "https://router.huggingface.co/v1/chat/completions";
  
  // We specify the model in the BODY now
  const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3";

  try {
    console.log(`\n🔌 Connecting to Hugging Face Router (${MODEL_ID})...`);
    
    // Lite Prompt for reliability
    const prompt = `
Topic: "${specificNiche}"

STRICT INSTRUCTIONS:
1. Write a short blog post (approx 200 words).
2. Format: Return EXACTLY 7 parts separated by "|||".
3. PIN_HOOK: 3-5 aggressive words (e.g. "STOP WASTING MONEY").
4. IMAGE_KEYWORD: 2 words max. No punctuation.
5. HTML_BODY: Use <p> and <h2> tags only.

REQUIRED OUTPUT FORMAT:
Category ||| Title ||| Intro ||| Quote ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY
`;

    const response = await axios.post(
      API_URL,
      {
        model: MODEL_ID, 
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 600, // Reduced to 600 for stability
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

    // PARSING: OpenAI-style response format
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Empty response from Hugging Face Router");
    }

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    // FAIL-SAFE PATCHING
    if (parts.length < 7) {
      console.warn(`⚠️ Formatting mismatch. Found ${parts.length} parts. Patching...`);
      return {
        category: parts[0] || "General",
        title: parts[1] || specificNiche,
        intro: parts[2] || "Here is a quick guide.",
        quote: parts[3] || "Stay consistent.",
        pinHook: parts[4] || "READ THIS", 
        imagePrompt: parts[5] || "minimalist",
        body: parts[6] || `<p>${text}</p>` 
      };
    }

    console.log("✅ Success with Hugging Face Router");

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
    // 503 means the model is "cold" and loading. 
    if (error.response?.status === 503) {
      throw new Error("Model is loading (503). Please wait 30 seconds and run again.");
    }
    const msg = error.response?.data?.error?.message || error.message;
    console.error(`❌ Hugging Face Error: ${msg}`);
    throw error;
  }
}

module.exports = { generateContent };

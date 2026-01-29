const axios = require("axios");

async function generateContent(specificNiche) {
  // FASTEST FREE MODELS (Prioritizing speed over "smartness")
  const models = [
    "meta-llama/llama-3-8b-instruct:free",    // Fast & Reliable
    "mistralai/mistral-7b-instruct:free",     // Solid backup
    "microsoft/phi-3-mini-128k-instruct:free",// Very fast
    "google/gemini-2.0-flash-exp:free"        // Smart but often busy
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`\nAttempting with: ${model}...`);
      
      // --- LITE PROMPT (Compressed for Speed) ---
      const prompt = `
Topic: ${specificNiche}
Format: 7 parts separated by "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

Rules:
1. PIN_HOOK: 3-5 aggressive words (e.g. "STOP WASTING MONEY").
2. IMAGE_KEYWORD: 2 words max (e.g. "modern kitchen"). NO punctuation.
3. HTML_BODY: Use <p> and <h2> tags only. Keep it short (300 words).
4. No conversational filler. Just the content.

Output ONLY the 7 parts joined by |||.
`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/content-automation-bot",
            "X-Title": "Content Bot"
          },
          timeout: 40000 // 40 seconds
        }
      );

      // Check for valid response
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Empty response");
      }

      const text = response.data.choices[0].message.content.trim();
      const parts = text.split("|||").map(p => p.trim());

      // FAIL-SAFE: If AI missed a section, use placeholders so bot doesn't crash
      if (parts.length < 7) {
        console.warn(`⚠️ Model ${model} missed sections. Found ${parts.length}. Trying to patch...`);
        // We ensure we return *something* even if imperfect
        return {
          category: parts[0] || "General",
          title: parts[1] || specificNiche,
          intro: parts[2] || "Here is a guide on this topic.",
          quote: parts[3] || "Stay consistent.",
          pinHook: parts[4] || "READ THIS NOW",
          imagePrompt: parts[5] || "lifestyle",
          body: parts[6] || "<p>Content generation incomplete.</p>"
        };
      }

      console.log(`✅ Success with ${model}`);

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
      const status = error.response?.status || 'N/A';
      const msg = error.response?.data?.error?.message || error.message;
      console.warn(`❌ ${model} failed (${status}): ${msg}`);
      lastError = msg;
    }
  }

  throw new Error(`All models failed. Final error: ${lastError}`);
}

module.exports = { generateContent };

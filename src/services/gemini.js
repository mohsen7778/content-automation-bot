const axios = require("axios");

async function generateContent(specificNiche) {
  // YOUR SELECTED MODELS
  const models = [
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-r1:free",
    "google/gemma-2-27b-it:free"
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`\n⏳ Waiting for ${model}... (This may take 1-2 mins)`);
      
      const prompt = `
Topic: ${specificNiche}
Format: 7 parts separated by "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

Rules:
1. PIN_HOOK: 3-5 aggressive words (e.g. "STOP WASTING MONEY").
2. IMAGE_KEYWORD: 2 words max (e.g. "modern kitchen"). NO punctuation.
3. HTML_BODY: Use <p> and <h2> tags only. Keep it short (300 words).

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
          // CHANGED: Increased from 50,000 to 180,000 (3 Minutes)
          timeout: 180000 
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Empty response");
      }

      const text = response.data.choices[0].message.content.trim();
      const parts = text.split("|||").map(p => p.trim());

      // FAIL-SAFE PATCHING
      if (parts.length < 7) {
        console.warn(`⚠️ Model ${model} missed sections. Patching...`);
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
      // If it's a timeout, it will explicitly say "ETIMEDOUT" or "timeout"
      const status = error.code === 'ECONNABORTED' ? 'TIMEOUT' : (error.response?.status || 'Error');
      const msg = error.message;
      console.warn(`❌ ${model} failed (${status}): ${msg}`);
      lastError = msg;
    }
  }

  throw new Error(`All models failed. Final error: ${lastError}`);
}

module.exports = { generateContent };

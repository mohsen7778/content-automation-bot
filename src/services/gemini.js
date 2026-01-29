const axios = require("axios");

async function generateContent(specificNiche) {
  // Verified stable 2026 Free IDs
  const models = [
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-7b-instruct:free", // Note: sometimes requires 'free' suffix, sometimes not
    "meta-llama/llama-3.1-8b-instruct:free",
    "openchat/openchat-7b:free"
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Trying ${model}...`);
      
      const prompt = `
Topic: ${specificNiche}
STRICT OUTPUT: 7 sections separated by "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY
STYLE: Human blogger, no AI clichés.
RULES: PIN_HOOK must be 3-5 aggressive words.
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
            "HTTP-Referer": "https://github.com/content-automation-bot", // Helps avoid 403/404
          },
          timeout: 40000 
        }
      );

      const text = response.data.choices[0].message.content.trim();
      const parts = text.split("|||").map(p => p.trim());

      if (parts.length < 7) throw new Error(`Format mismatch: ${parts.length}/7`);

      return { 
        category: parts[0], title: parts[1], intro: parts[2],
        quote: parts[3], pinHook: parts[4], imagePrompt: parts[5], body: parts[6] 
      };

    } catch (error) {
      lastError = error.response?.data?.error?.message || error.message;
      console.warn(`Model ${model} failed: ${lastError}`);
    }
  }

  throw new Error(`All endpoints failed. Final error: ${lastError}`);
}

module.exports = { generateContent };

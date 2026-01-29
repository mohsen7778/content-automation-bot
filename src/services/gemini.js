const axios = require("axios");

async function generateContent(specificNiche) {
  // List of free models to try in order
  const models = [
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-7b-instruct:free",
    "huggingfaceh4/zephyr-7b-beta:free"
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Attempting with model: ${model}...`);
      
      const prompt = `
Topic: ${specificNiche}

STRICT OUTPUT FORMAT:
You must provide 7 sections separated by exactly "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

VOICE AND STYLE:
You are a professional human blogger. Avoid all AI clichés. Use varied sentence lengths. Use contractions. Keep the tone conversational but authoritative.

SPECIFIC SECTION RULES:
- PIN_HOOK: A 3-5 word aggressive hook for Pinterest (e.g., "STOP WASTING MONEY").
- IMAGE_KEYWORD: 2-3 words for Pexels search.
- HTML_BODY: Use ONLY <p> and <h2> tags.

Output ONLY the 7 sections separated by |||.
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
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const text = response.data.choices[0].message.content.trim();
      const parts = text.split("|||").map(p => p.trim());

      if (parts.length < 7) {
        throw new Error(`AI output section mismatch. Found ${parts.length}/7`);
      }

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
      lastError = error.response?.data?.error?.message || error.message;
      console.warn(`Model ${model} failed: ${lastError}. Trying next...`);
      // Continue to next model in the list
    }
  }

  throw new Error(`All models failed. Last error: ${lastError}`);
}

module.exports = { generateContent };

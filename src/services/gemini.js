const axios = require("axios");

async function generateContent(specificNiche) {
  // We use Mistral 7B because it is free on HF and smart enough to format correctly.
  // Flan-t5-small is too weak and will crash the bot.
  const MODEL_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3";

  try {
    console.log(`\n🔌 Connecting to Hugging Face (${MODEL_URL})...`);
    
    // ULTRA-LITE PROMPT (200 Words, Strict Format)
    const prompt = `
<s>[INST] You are a blogger. Write a short post about: "${specificNiche}".

STRICT INSTRUCTIONS:
1. Total length: roughly 200 words.
2. Format: Return EXACTLY 7 parts separated by "|||".
3. PIN_HOOK: 3-5 aggressive words (e.g. "STOP WASTING MONEY").
4. IMAGE_KEYWORD: 2 words max. No punctuation.
5. HTML_BODY: Use <p> and <h2> tags only.

REQUIRED OUTPUT FORMAT (Do not add intro text, just the parts):
Category ||| Title ||| Intro (2 sentences) ||| Short Quote ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY (150 words)
[/INST]
`;

    const response = await axios.post(
      MODEL_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000, // Enough for 200 words
          return_full_text: false, // Don't repeat the prompt
          temperature: 0.7
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`, // Make sure this secret exists!
          "Content-Type": "application/json"
        },
        timeout: 60000 // 60s timeout
      }
    );

    // Hugging Face returns an array: [{ generated_text: "..." }]
    if (!response.data || !response.data[0] || !response.data[0].generated_text) {
      throw new Error("Empty response from Hugging Face");
    }

    const text = response.data[0].generated_text.trim();
    
    // Clean up if the model adds "Category:" prefixes
    const cleanText = text.replace(/Category:/gi, "").replace(/Title:/gi, "");
    const parts = cleanText.split("|||").map(p => p.trim());

    // FAIL-SAFE: If the model is dumb and misses a section, fill it in.
    if (parts.length < 7) {
      console.warn(`⚠️ Formatting mismatch. Found ${parts.length} parts. Patching...`);
      return {
        category: parts[0] || "General",
        title: parts[1] || specificNiche,
        intro: parts[2] || "Here is a quick guide.",
        quote: parts[3] || "Keep it simple.",
        pinHook: parts[4] || "READ THIS", // Fallback Hook
        imagePrompt: parts[5] || "minimalist",
        body: parts[6] || `<p>${text}</p>` // Dump raw text if formatting failed completely
      };
    }

    console.log("✅ Success with Hugging Face");

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
    // If model is loading (503), it means it's "cold".
    if (error.response?.status === 503) {
      throw new Error("Model is loading (503). Please wait 30 seconds and run again.");
    }
    const msg = error.response?.data?.error || error.message;
    console.error(`❌ Hugging Face Error: ${msg}`);
    throw error;
  }
}

module.exports = { generateContent };

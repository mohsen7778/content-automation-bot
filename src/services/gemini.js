const axios = require("axios");

async function generateContent(specificNiche) {
  // CORRECT URL provided by you
  const MODEL_URL = "https://router.huggingface.co/hf-inference/models/google/flan-t5-small";

  try {
    console.log(`\n🔌 Connecting to Hugging Face (${MODEL_URL})...`);
    
    // Prompt formatted for an Instruct Model (<s>[INST]...[/INST])
    const prompt = `
<s>[INST] You are a blogger. Write a short post about: "${specificNiche}".

STRICT INSTRUCTIONS:
1. Total length: roughly 200 words.
2. Format: Return EXACTLY 7 parts separated by "|||".
3. PIN_HOOK: 3-5 aggressive words (e.g. "STOP WASTING MONEY").
4. IMAGE_KEYWORD: 2 words max. No punctuation.
5. HTML_BODY: Use <p> and <h2> tags only.

REQUIRED OUTPUT FORMAT (Do not add intro text, just the parts):
Category ||| Title ||| Intro ||| Quote ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY
[/INST]
`;

    const response = await axios.post(
      MODEL_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 400, // Stability setting
          return_full_text: false, // Don't repeat the prompt
          temperature: 0.7
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 60000 // 60s timeout
      }
    );

    // Hugging Face Inference API returns an array: [{ generated_text: "..." }]
    if (!response.data || !response.data[0] || !response.data[0].generated_text) {
      throw new Error("Empty response from Hugging Face");
    }

    const text = response.data[0].generated_text.trim();
    
    // Clean up if the model adds "Category:" prefixes
    const cleanText = text.replace(/Category:/gi, "").replace(/Title:/gi, "");
    const parts = cleanText.split("|||").map(p => p.trim());

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
    if (error.response?.status === 503) {
      throw new Error("Model is loading (503). Please wait 30 seconds and run again.");
    }
    const msg = error.response?.data?.error || error.message;
    console.error(`❌ Hugging Face Error: ${msg}`);
    throw error;
  }
}

module.exports = { generateContent };

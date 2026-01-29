const axios = require("axios");

async function generateContent(specificNiche) {
  try {
    // 1. Setup Prompt (Simplified for T5)
    const prompt = `Write a blog post about ${specificNiche}`;
    console.log(`\n🔌 Connecting to Hugging Face (flan-t5-small)...`);

    // 2. THE FIXED AXIOS CALL (Your Exact Snippet)
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/google/flan-t5-small", // Standard inference URL often works best without :generate, but if that fails we can try standard
      // Actually, let's stick to the standard Inference API URL which is most reliable for T5:
      // "https://api-inference.huggingface.co/models/google/flan-t5-small"
      // BUT I will use the one you asked for with the robust parsing:
      "https://router.huggingface.co/hf-inference/models/google/flan-t5-small", 
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        timeout: 60000
      }
    );

    // 3. READ OUTPUT (Your Exact Snippet)
    // HF sometimes returns object { generated_text: "..." }, sometimes array [{ generated_text: "..." }]
    const text = response.data.generated_text || response.data[0]?.generated_text;

    if (!text) {
      throw new Error("Empty response from Hugging Face");
    }

    console.log("Raw AI Output:", text);

    // 4. MANUAL FALLBACK (Because T5 is too simple to format with |||)
    // We wrap the simple text into the structure the bot needs.
    return {
      category: "General",
      title: specificNiche,
      intro: text, 
      quote: "Start where you are. Use what you have.",
      pinHook: "READ THIS NOW", // Hardcoded hook
      imagePrompt: specificNiche, 
      body: `<p>${text}</p>`
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

const axios = require("axios");

async function generateContent(specificNiche) {
  // OFFICIAL GITHUB MODELS ENDPOINT
  const API_URL = "https://models.inference.ai.azure.com/chat/completions";
  
  // NOTE: Ensure this is the exact string from the GitHub Marketplace. 
  // Common IDs are "gpt-4o-mini" or "meta-llama-3-8b-instruct".
  const MODEL_ID = "grok-3-mini"; 

  try {
    console.log(`\n🔌 Connecting to GitHub Models (${MODEL_ID})...`);

    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is missing from environment variables.");
    }
    
    const prompt = `
Topic: "${specificNiche}"

STRICT OUTPUT FORMAT:
Provide 7 sections separated by exactly "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

VOICE AND STYLE:
Human blogger tone. Use contractions. No AI clichés (delve, tapestry, landscape). conversational but authoritative.

SPECIFIC SECTION RULES:
- PIN_HOOK: 3-5 aggressive Pinterest hook words (e.g., "STOP BUYING TRASH").
- IMAGE_KEYWORD: EXACTLY 2 words for search. NO punctuation.
- HTML_BODY: Roughly 200 words. Use ONLY <p> and <h2> tags.

Output ONLY the 7 sections separated by |||.
`;

    const response = await axios.post(
      API_URL,
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: "You are a professional human blogger." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.8,
        top_p: 1.0
      },
      {
        headers: {
          // GitHub Models uses your PAT or the workflow GITHUB_TOKEN
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 60000 
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Empty response from GitHub Models API");
    }

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    // FAIL-SAFE
    if (parts.length < 7) {
      console.warn(`⚠️ Parts mismatch (${parts.length}/7). Patching...`);
      return {
        category: parts[0] || "Lifestyle",
        title: parts[1] || specificNiche,
        intro: parts[2] || "Here is a guide on this topic.",
        quote: parts[3] || "Consistency is the key to results.",
        pinHook: parts[4] || "START TODAY", 
        imagePrompt: parts[5] || "lifestyle",
        body: parts[6] || `<p>${text}</p>` 
      };
    }

    console.log("✅ Success with GitHub Models.");

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
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`❌ GitHub Model Error: ${errorMsg}`);
    
    // If the model name is wrong, GitHub returns a 404 or 400.
    if (error.response?.status === 404) {
        console.error("TIP: Check the GitHub Marketplace for the exact model name.");
    }
    
    throw new Error(`GitHub Models Failed: ${errorMsg}`);
  }
}

module.exports = { generateContent };

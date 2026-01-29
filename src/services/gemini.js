const axios = require("axios");

async function generateContent(specificNiche) {
  try {
    const prompt = `
Topic: ${specificNiche}

STRICT OUTPUT FORMAT:
You must provide 6 sections separated by exactly "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

VOICE AND STYLE:
You are a professional human blogger. Avoid all AI clichés (e.g., 'In the rapidly evolving landscape,' 'tapestry,' 'delve'). Use varied sentence lengths. Use contractions. Use occasional personal anecdotes or rhetorical questions to engage the reader. Keep the tone conversational but authoritative.

SPECIFIC SECTION RULES:
- PIN_HOOK: A 3-5 word aggressive "psychological hook" for Pinterest (e.g., "STOP WASTING MONEY", "THE HIDDEN TRUTH", "7 ITEMS TO TOSS").
- IMAGE_KEYWORD: 2-3 words for Pexels search (e.g., "minimalist kitchen").
- HTML_BODY: Use ONLY <p> and <h2> tags. No markdown.

Output ONLY the 7 sections separated by |||.
`;

    console.log("Requesting from OpenRouter...");
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 7) {
      throw new Error("OpenRouter failed to output all 7 sections.");
    }

    return { 
      category: parts[0],
      title: parts[1], 
      intro: parts[2],
      quote: parts[3],
      pinHook: parts[4], // The new psychological hook
      imagePrompt: parts[5], 
      body: parts[6] 
    };

  } catch (error) {
    console.error("OpenRouter Error:", error.message);
    throw error;
  }
}

module.exports = { generateContent };

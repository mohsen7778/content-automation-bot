const axios = require("axios");

async function generateContent(specificNiche) {
  try {
    const prompt = `
Topic: ${specificNiche}

STRICT OUTPUT FORMAT:
You must provide 7 sections separated by exactly "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| PIN_HOOK ||| IMAGE_KEYWORD ||| HTML_BODY

VOICE AND STYLE:
You are a professional human blogger. Avoid all AI clichés. Use varied sentence lengths. Use contractions. Use occasional personal anecdotes. Keep the tone conversational but authoritative.

SPECIFIC SECTION RULES:
- PIN_HOOK: A 3-5 word aggressive "psychological hook" for Pinterest.
- IMAGE_KEYWORD: 2-3 words for Pexels search.
- HTML_BODY: Use ONLY <p> and <h2> tags. No markdown.

Output ONLY the 7 sections separated by |||.
`;

    console.log("Requesting from OpenRouter (gemini-2.0-flash-exp:free)...");
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // CHANGED MODEL TO A MORE STABLE FREE OPTION
        model: "google/gemini-2.0-flash-exp:free", 
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/content-automation-bot", // OpenRouter likes to see a referer
          "X-Title": "Content Automation Bot"
        }
      }
    );

    // Safety check for response data
    if (!response.data || !response.data.choices) {
        throw new Error("Invalid response from OpenRouter");
    }

    const text = response.data.choices[0].message.content.trim();
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 7) {
      console.log("AI Output was:", text);
      throw new Error(`AI failed to output all 7 sections. Found: ${parts.length}`);
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
    // Cleaner error logging
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error("OpenRouter Error Detail:", errorMsg);
    throw new Error(`OpenRouter Failed: ${errorMsg}`);
  }
}

module.exports = { generateContent };

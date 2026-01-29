const axios = require("axios");

async function generateContent(specificNiche) {
  try {
    const prompt = `
Topic: ${specificNiche}

STRICT OUTPUT FORMAT:
You must provide 6 sections separated by exactly "|||".
Order: CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| IMAGE_KEYWORD ||| HTML_BODY

VOICE AND STYLE:
You are a professional human blogger. Avoid all AI clichés (e.g., 'In the rapidly evolving landscape,' 'tapestry,' 'delve'). Use varied sentence lengths. Use contractions. Use occasional personal anecdotes or rhetorical questions to engage the reader. Keep the tone conversational but authoritative.

RULES:
- No greetings. Start directly.
- HTML_BODY must use ONLY <p> and <h2> tags.
- No markdown symbols.
- Output ONLY the 6 sections separated by |||.
`;

    console.log("Requesting from OpenRouter (gpt-oss-120b:free)...");
    
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
    
    // Split the sections by the pipe separator
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 6) {
      console.error("Received raw text:", text);
      throw new Error("OpenRouter failed to output all 6 sections.");
    }

    return { 
      category: parts[0],
      title: parts[1], 
      intro: parts[2],
      quote: parts[3],
      imagePrompt: parts[4], 
      body: parts[5] 
    };

  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error("OpenRouter Error:", errorData);
    throw error;
  }
}

module.exports = { generateContent };

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are a thoughtful writer for Notes from Mia.
    Topic: ${specificNiche}
    
    STRICT OUTPUT FORMAT:
    You must provide 6 sections separated by exactly "|||".
    
    Order:
    CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| IMAGE_KEYWORD ||| HTML_BODY
    
    Rules:
    - Write 2 to 3 full pages. Use a warm, human, reflective tone.
    - STRICT: Do not use dashes (— or -) anywhere. Use commas or colons.
    - Body: Use ONLY <p> and <h2> tags. No markdown like ** or ##.
    - Output only the requested sections.
    `;

    console.log("Gemini is composing...");
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Split and clean labels if AI accidentally includes them (e.g., "TITLE: ...")
    const parts = text.split("|||").map(p => p.replace(/^(CATEGORY|TITLE|INTRO|QUOTE|IMAGE_KEYWORD|HTML_BODY|BODY):\s*/i, "").trim());

    if (parts.length < 6) {
        console.error("Format Error: Received parts:", parts.length);
        throw new Error("Gemini failed to output all 6 sections.");
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
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateContent };

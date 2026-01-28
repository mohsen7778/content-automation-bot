const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(specificNiche) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Topic: ${specificNiche}

STRICT OUTPUT FORMAT:
You must provide 6 sections separated by exactly "|||".

Order:
CATEGORY ||| TITLE ||| INTRO ||| QUOTE ||| IMAGE_KEYWORD ||| HTML_BODY

ABSOLUTE RULES:
- Output ONLY the 6 sections separated by |||.
- Do not add labels, explanations, or extra text.
- No greetings. Start directly.
- Write 2 to 3 full pages total.
- Do NOT summarize at the end. Never use conclusion, summary, overall, or ultimately.
- End the body on a punchy unresolved thought or a specific call to action.

VOICE AND POV:
- Write like a thoughtful, grounded human guide, not a helpful assistant.
- First person is allowed but not required.
- Calm, reflective, slightly critical tone.
- Neutral, polite, or corporate tone is banned.

LANGUAGE:
- Use simple, everyday words only.
- No buzzwords. No marketing tone. No hype.
- STRICT: Do not use hyphens or em dashes anywhere. Use commas or colons instead.
- Do not use quotation marks anywhere in the output.
- Avoid passive voice.
- No moralizing.

CRITICAL ANTI AI STYLE RULE:
- NEVER use contrast negation structures such as:
  not just X but Y,
  not about X but about Y,
  this is not X, it is Y,
  more than just,
  less about X and more about Y.
- Always state ideas directly and affirmatively.
- Do not correct an imagined reader assumption.

BANNED WORDS AND PHRASES:
delve, tapestry, unleash, unlock, navigate, landscape, game changer, game changing, transformative, leverage, in today’s world, in today’s digital age, paradigm shift, crucial, testament, myriad, in conclusion, it is important to note, remember that, ultimately, bustling.

STYLE AND RHYTHM:
- Write like someone observing and thinking, not narrating a story.
- Mix very short sentences with longer ones.
- It is okay to start sentences with and or but.
- Avoid repetitive or symmetrical sentence patterns.
- Avoid list heavy structure. Write like a blog, not documentation.

HUMAN SIGNALS (REQUIRED):
- Include at least one brief parenthetical clarification or rephrasing, but keep it neutral and practical.
- Address the reader once directly to clarify a likely doubt.
- Use specific, everyday observations or small frictions without framing them as personal stories.

OPENING RULE:
- Start the INTRO in the middle of a thought.
- The first word must be So, or And.
- Do not clearly introduce the topic until later in the INTRO.

STRUCTURE:
- HTML_BODY must use ONLY <p> and <h2> tags.
- No markdown. No symbols like ** or ##.
- Visual pacing is required: alternate longer paragraphs with single sentence paragraphs.
- Slight visual choppiness is intentional.

QUOTE SECTION:
- Write one short reflective sentence.
- Do not use quotation marks.

ANTI AI BEHAVIOR:
- Do not sound helpful, optimized, or instructional.
- Do not explain the process.
- Never mention AI.
- One natural pass only. No polishing language.

REMEMBER:
You are guiding the reader, not performing or storytelling.
`;

    console.log("Gemini is composing (Grounded Guide Mode)...");
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Split by the exact separator
    const parts = text.split("|||").map(p => p.trim());

    if (parts.length < 6) {
        console.error("Format Error: Received parts:", parts.length);
        throw new Error("Gemini failed to output all 6 sections correctly.");
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

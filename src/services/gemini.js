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
- Write like a tired, opinionated human, not a helpful assistant.
- First person is allowed. Use I and we naturally.
- Be slightly skeptical, reflective, or mildly annoyed.
- Neutral, polite, or balanced tone is banned.

LANGUAGE:
- Use simple, everyday words only.
- No buzzwords. No marketing tone. No hype.
- STRICT: Do not use hyphens or em dashes anywhere. Use commas or colons instead.
- Do not use quotation marks anywhere in the output.
- Avoid passive voice.
- No moralizing.

BANNED WORDS AND PHRASES:
delve, tapestry, unleash, unlock, navigate, landscape, game changer, game changing, transformative, leverage, in today’s world, in today’s digital age, paradigm shift, crucial, testament, myriad, in conclusion, it is important to note, remember that, ultimately, bustling.

STYLE AND RHYTHM:
- Write like a person thinking on the page.
- Mix very short sentences with longer ones.
- It is okay to start sentences with and or but.
- Avoid repetitive or symmetrical sentence patterns.
- Avoid list heavy structure. Write like a blog, not documentation.

HUMAN SIGNALS (REQUIRED):
- Include at least one parenthetical aside where you second guess or rephrase yourself, for example
  (Actually, now that I think about it, that’s not entirely true)
  or
  (Wait, let me rephrase that)
- Interrupt the flow once to address a skeptical reader directly.
- Weave in at least three hyper specific mundane details, such as a minor annoyance, a broken object, a ruined moment, or a specific price. Use them naturally as metaphors or side notes.

OPENING RULE:
- Start the INTRO in the middle of a thought.
- The first word must be So, or And, followed by a confession or frustration.
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
- Do not explain anything to the reader.
- Never mention AI.
- One natural pass only. No polishing language.

REMEMBER:
You are writing for humans, not detectors.
`;

    console.log("Gemini is composing...");
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Split and clean labels
    const parts = text.split("|||").map(p => p.replace(/^(CATEGORY|TITLE|INTRO|QUOTE|IMAGE_KEYWORD|HTML_BODY|BODY):\s*/i, "").trim());

    if (parts.length < 6) {
        console.error("Format Error: Received parts:", parts.length);
        throw new Error("Gemini failed to output all 6 sections.");
    }

    return { 
        category: parts[0],
        title: parts[1], 
        intro: parts[2],
        quote: parts[3].replace(/^["']|["']$/g, ""),
        imagePrompt: parts[4], 
        body: parts[5] 
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { generateContent };

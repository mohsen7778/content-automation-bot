async function generateBlogPost(retries = 3) {
  try {
    // Try Gemini 1.5 Flash if Gemini 3 is overloaded
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Write a short, engaging blog post about a trending tech topic. " +
                   "Return ONLY this format:\nTITLE: [Title]\nCONTENT: [HTML]";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // ... (keep your existing TITLE/CONTENT splitting logic here) ...

    return { title, content };

  } catch (error) {
    if (error.status === 503 && retries > 0) {
      console.log(`Server overloaded. Retrying in 5 seconds... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return generateBlogPost(retries - 1);
    }
    throw error;
  }
}
